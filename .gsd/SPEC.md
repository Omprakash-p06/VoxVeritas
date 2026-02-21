# SPEC.md — Project Specification

> **Status**: `FINALIZED`

## Vision
VoxVeritas is a voice-first, RAG-powered accessibility assistant designed to help millions of people with visual or motor disabilities independently access, navigate, and query information. Unlike rigid, non-conversational screen readers, VoxVeritas allows users to speak naturally to their device—ingesting spoken queries to contextually answer questions about on-screen content or uploaded documents in an unbroken, screen-reader-independent flow.

## Goals
1. **End-to-end Voice Query Demo**: Deliver a seamless live demo where a user speaks a question, the system transcribes it, retrieves relevant data, generates a grounded answer using Sarvam-1, and reads it back via Kokoro TTS.
2. **Current Screen Reading**: Support reading and querying the user's current screen layout/text when triggered by a voice prompt.
3. **Document-Grounded Answers**: Responses must cite the source document to prove it is RAG-based and not a hallucination.
4. **Multilingual Input**: Support for Indic languages to guarantee accessibility for a broader demographic.
5. **Quality Engineering**: Strict adherence to Google-style Python implementation and modular architecture.

## Non-Goals (Out of Scope)
- User account management and multi-tenant support.
- Training new models from scratch (pure inference with existing open-weight models only).
- Large-scale cloud deployment and auto-scaling.
- Frivolous UI polish at the expense of core functionality.

## Users
- **Primary Users**: Visually impaired users needing voice-first interfaces, users with motor impairments preferring speech over keyboard input, and elderly or non-literate users consuming content via audio.
- **Secondary Users**: Hackathon judges evaluating the architecture, safety, and live demo capability.

## Constraints
- **Hardware**: Target execution on a single local machine with an NVIDIA RTX 3050 4 GB GPU and at least 16 GB RAM.
- **Technology Stack**: Open-weights models only (Sarvam-1 2B, Whisper, Kokoro-82M).
- **Execution**: Must execute locally without internet reliance after initial downloads.
- **Memory**: GPU VRAM bound to 4GB requires heavy reliance on quantized models and careful memory management.

## Success Criteria
- [ ] A live voice query successfully answers a question based on an uploaded document and reads it back.
- [ ] The system accurately fetches and processes the current on-screen text when asked.
- [ ] The generated answer contains a citation from the uploaded document.
- [ ] The system handles at least one multilingual voice input correctly.
- [ ] A safety dashboard displays pass/fail metrics from Promptfoo evaluations.
