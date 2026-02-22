import { useState, useEffect, useCallback } from 'react';
import { 
  PixelPlay, PixelRefresh, PixelChevronDown, PixelChevronUp, 
  PixelTerminal, PixelCheck, PixelX, PixelWarning, PixelFile,
  PixelDownload
} from '@/components/ui-custom/PixelIcons';
import { StatusBadge } from '@/components/ui-custom/StatusBadge';
import { getSafetyReport, runSafetyTests } from '@/api/safety';
import type { SafetyReport, SafetyFailure } from '@/types';
import { format } from 'date-fns';

interface SummaryCardProps {
  title: string;
  value: number;
  subValue?: string;
  variant: 'neutral' | 'success' | 'danger';
  icon: React.ReactNode;
}

function SummaryCard({ title, value, subValue, variant, icon }: SummaryCardProps) {
  const variantClasses = {
    neutral: 'border-[var(--color-border)]',
    success: 'border-[var(--color-success)]',
    danger: 'border-[var(--color-danger)]',
  };

  return (
    <div className={`border-4 ${variantClasses[variant]} bg-[var(--color-surface)] p-4 relative`}>
      <div className="pixel-corner pixel-corner-tl" />
      <div className="pixel-corner pixel-corner-tr" />
      <div className="pixel-corner pixel-corner-bl" />
      <div className="pixel-corner pixel-corner-br" />
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="pixel-text-sm text-[var(--color-text-secondary)] uppercase tracking-wider">{title}</p>
          <p className="pixel-text-xl text-[var(--color-text-primary)] mt-1">
            {value}
          </p>
          {subValue && (
            <p className={`pixel-text-sm mt-1 ${variant === 'success' ? 'text-[var(--color-success)]' : variant === 'danger' ? 'text-[var(--color-danger)]' : 'text-[var(--color-text-secondary)]'}`}>
              {subValue}
            </p>
          )}
        </div>
        <div className="w-12 h-12 border-2 border-[var(--color-border)] bg-[var(--color-surface-raised)] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

interface CategoryBarProps {
  name: string;
  passed: number;
  total: number;
}

function CategoryBar({ name, passed, total }: CategoryBarProps) {
  const percentage = total > 0 ? (passed / total) * 100 : 0;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="pixel-text text-[var(--color-text-primary)] uppercase tracking-wider">{name}</span>
        <span className="pixel-text-sm text-[var(--color-text-secondary)]">
          {passed}/{total} <span className={percentage >= 80 ? 'text-[var(--color-success)]' : 'text-[var(--color-warning)]'}>[{percentage >= 80 ? 'PASS' : 'WARN'}]</span>
        </span>
      </div>
      <div className="h-4 bg-[var(--color-border)] border-2 border-[var(--color-border)] overflow-hidden">
        <div 
          className={`h-full transition-all duration-500 ${percentage >= 80 ? 'bg-[var(--color-success)]' : percentage >= 50 ? 'bg-[var(--color-warning)]' : 'bg-[var(--color-danger)]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface FailureRowProps {
  failure: SafetyFailure;
  isExpanded: boolean;
  onToggle: () => void;
}

function FailureRow({ failure, isExpanded, onToggle }: FailureRowProps) {
  const getCategoryVariant = (category: string) => {
    switch (category) {
      case 'hallucination': return 'warning';
      case 'prompt_injection': return 'danger';
      case 'harmful_advice': return 'danger';
      default: return 'neutral';
    }
  };

  return (
    <div className="border-2 border-[var(--color-border)] bg-[var(--color-surface)]">
      <button
        onClick={onToggle}
        className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-surface-raised)] transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-4">
          <PixelX className="w-5 h-5 text-[var(--color-danger)]" />
          <span className="pixel-text text-[var(--color-text-primary)]">{failure.test_id}</span>
          <StatusBadge 
            variant={getCategoryVariant(failure.category) as 'warning' | 'danger' | 'neutral'} 
            label={failure.category.toUpperCase().replace('_', ' ')} 
          />
        </div>
        {isExpanded ? (
          <PixelChevronUp className="w-4 h-4 text-[var(--color-text-secondary)]" />
        ) : (
          <PixelChevronDown className="w-4 h-4 text-[var(--color-text-secondary)]" />
        )}
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t-2 border-[var(--color-border)] bg-[var(--color-bg)]">
          <div className="pt-4 space-y-3">
            <div>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-1">PROMPT:</p>
              <p className="pixel-text-sm text-[var(--color-text-primary)] bg-[var(--color-surface)] p-2 border-2 border-[var(--color-border)]">
                &ldquo;{failure.prompt}&rdquo;
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-1">EXPECTED:</p>
                <p className="pixel-text-sm text-[var(--color-success)]">{failure.expected}</p>
              </div>
              <div>
                <p className="pixel-text-sm text-[var(--color-text-secondary)] mb-1">ACTUAL:</p>
                <p className="pixel-text-sm text-[var(--color-danger)]">{failure.actual}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function SafetyView() {
  const [report, setReport] = useState<SafetyReport | null>(null);
  const [, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [expandedFailure, setExpandedFailure] = useState<number | null>(null);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);

  const addLog = useCallback((message: string) => {
    const timestamp = format(new Date(), 'HH:mm:ss');
    setSystemLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  }, []);

  const loadReport = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getSafetyReport();
      setReport(data);
      addLog('SAFETY REPORT LOADED');
    } catch (err) {
      addLog('ERROR: FAILED TO LOAD REPORT');
    } finally {
      setIsLoading(false);
    }
  }, [addLog]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const handleRunTests = async () => {
    try {
      setIsRunning(true);
      addLog('STARTING SAFETY EVALUATION...');
      await runSafetyTests();
      
      // Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const data = await getSafetyReport();
          if (data.status === 'completed') {
            clearInterval(pollInterval);
            setReport(data);
            setIsRunning(false);
            addLog(`EVALUATION COMPLETE: ${data.summary.passed}/${data.summary.total} PASSED`);
          }
        } catch (err) {
          clearInterval(pollInterval);
          setIsRunning(false);
          addLog('ERROR: POLLING FAILED');
        }
      }, 2000);
    } catch (err) {
      setIsRunning(false);
      addLog('ERROR: FAILED TO START TESTS');
    }
  };

  const passRate = report ? Math.round(report.summary.pass_rate * 100) : 0;

  return (
    <div className="min-h-[calc(100vh-64px)] relative">
      {/* Pixel Grid Background */}
      <div className="absolute inset-0 pixel-grid pointer-events-none" />
      
      <div className="relative z-10 p-6">
        <div className="max-w-[1200px] mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 pixel-text-sm text-[var(--color-text-secondary)] mb-2">
                <PixelTerminal className="w-4 h-4" />
                <span>{'> SYSTEM_READY'}</span>
              </div>
              <h1 className="pixel-text-xl text-[var(--color-text-primary)]">
                VOXVERITAS<span className="text-[var(--color-primary)]">.SAFETY</span>
              </h1>
              <p className="pixel-text-sm text-[var(--color-text-secondary)] mt-1">
                EVALUATION DASHBOARD v1.1
              </p>
            </div>
            <div className="text-right space-y-1">
              <div className="pixel-text-sm text-[var(--color-text-secondary)]">
                STATUS: <span className="text-[var(--color-success)]">ONLINE</span>
              </div>
              <div className="pixel-text-sm text-[var(--color-text-secondary)]">
                LAST_RUN: {report ? format(new Date(report.timestamp), 'yyyy-MM-dd HH:mm') : 'N/A'}
              </div>
              <button
                onClick={handleRunTests}
                disabled={isRunning}
                className="mt-2 flex items-center gap-2 px-4 py-2 bg-[var(--color-primary)] text-white border-4 border-[var(--color-border)] pixel-text-sm font-bold hover:bg-[var(--color-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ boxShadow: '4px 4px 0 var(--color-border)' }}
              >
                {isRunning ? (
                  <><PixelRefresh className="w-4 h-4 animate-spin" /> RUNNING...</>
                ) : (
                  <><PixelPlay className="w-4 h-4" /> RUN_TESTS</>
                )}
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          {report && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <SummaryCard
                title="TOTAL TESTS"
                value={report.summary.total}
                subValue={`/ ${report.summary.total}`}
                variant="neutral"
                icon={<PixelFile className="w-6 h-6 text-[var(--color-text-secondary)]" />}
              />
              <SummaryCard
                title="PASSED"
                value={report.summary.passed}
                subValue={`${passRate}%`}
                variant="success"
                icon={<PixelCheck className="w-6 h-6 text-[var(--color-success)]" />}
              />
              <SummaryCard
                title="FAILED"
                value={report.summary.failed}
                subValue={report.summary.failed > 0 ? 'CRITICAL' : 'ALL CLEAR'}
                variant={report.summary.failed > 0 ? 'danger' : 'neutral'}
                icon={<PixelWarning className="w-6 h-6 text-[var(--color-danger)]" />}
              />
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Categories & Failing Tests */}
            <div className="lg:col-span-2 space-y-6">
              {/* By Category */}
              {report && (
                <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] p-4 relative">
                  <div className="pixel-corner pixel-corner-tl" />
                  <div className="pixel-corner pixel-corner-tr" />
                  <div className="pixel-corner pixel-corner-bl" />
                  <div className="pixel-corner pixel-corner-br" />
                  
                  <div className="flex items-center justify-between mb-4 relative z-10">
                    <h3 className="pixel-text font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                      <span className="text-[var(--color-primary)]">{'>'}</span>
                      BY CATEGORY
                    </h3>
                    <span className="pixel-text-sm text-[var(--color-text-secondary)]">[BREAKDOWN]</span>
                  </div>
                  <div className="space-y-4 relative z-10">
                    <CategoryBar
                      name="HALLUCINATION"
                      passed={report.categories.hallucination.passed}
                      total={report.categories.hallucination.total}
                    />
                    <CategoryBar
                      name="PROMPT INJECTION"
                      passed={report.categories.prompt_injection.passed}
                      total={report.categories.prompt_injection.total}
                    />
                    <CategoryBar
                      name="HARMFUL ADVICE"
                      passed={report.categories.harmful_advice.passed}
                      total={report.categories.harmful_advice.total}
                    />
                  </div>
                </div>
              )}

              {/* Failing Tests */}
              {report && report.failures.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="pixel-text-lg font-bold text-[var(--color-danger)] flex items-center gap-2">
                      <PixelWarning className="w-5 h-5" />
                      FAILING TESTS
                    </h3>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          if (!report) return;
                          const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `safety_report_${report.run_id}.json`;
                          a.click();
                          URL.revokeObjectURL(url);
                          addLog('EXPORTED REPORT AS JSON');
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors"
                      >
                        <PixelDownload className="w-4 h-4" />
                        EXPORT
                      </button>
                      <button 
                        onClick={handleRunTests}
                        disabled={isRunning}
                        className="flex items-center gap-1 px-3 py-1.5 pixel-text-sm border-2 border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] transition-colors disabled:opacity-50"
                      >
                        <PixelRefresh className="w-4 h-4" />
                        RE-RUN
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {report.failures.map((failure, idx) => (
                      <FailureRow
                        key={failure.test_id}
                        failure={failure}
                        isExpanded={expandedFailure === idx}
                        onToggle={() => setExpandedFailure(expandedFailure === idx ? null : idx)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - System Log */}
            <div className="space-y-6">
              <div className="border-4 border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
                <div className="px-4 py-2 border-b-4 border-[var(--color-border)] flex items-center justify-between bg-[var(--color-surface-raised)]">
                  <span className="pixel-text-sm text-[var(--color-text-secondary)]">SYS_LOG</span>
                  <button 
                    onClick={() => setSystemLogs([])}
                    className="pixel-text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                  >
                    CLEAR
                  </button>
                </div>
                <div className="p-4 h-64 overflow-y-auto pixel-text-sm space-y-1 font-mono">
                  {systemLogs.length === 0 ? (
                    <span className="text-[var(--color-text-disabled)]">NO LOGS...</span>
                  ) : (
                    systemLogs.map((log, idx) => (
                      <div 
                        key={idx} 
                        className={`
                          ${log.includes('ERROR') ? 'text-[var(--color-danger)]' : ''}
                          ${log.includes('COMPLETE') ? 'text-[var(--color-success)]' : ''}
                          ${!log.includes('ERROR') && !log.includes('COMPLETE') ? 'text-[var(--color-text-secondary)]' : ''}
                        `}
                      >
                        {log}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="grid grid-cols-3 gap-2">
                <div className="aspect-square bg-[var(--color-surface)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-primary)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-primary)]/50 border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-surface)] border-2 border-[var(--color-border)]" />
                <div className="aspect-square bg-[var(--color-surface-raised)] border-2 border-[var(--color-border)]" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-6 border-t-4 border-[var(--color-border)]">
            <div className="flex items-center justify-between pixel-text-sm text-[var(--color-text-secondary)]">
              <span>VOXVERITAS SAFETY MODULE // CONFIDENTIAL</span>
              <div className="flex items-center gap-4">
                <span>{'>'} PRIVACY_PROTOCOL</span>
                <span>{'>'} TERMS_OF_SERVICE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
