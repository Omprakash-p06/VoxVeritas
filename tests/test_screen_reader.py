import pytest
from src.services.screen_reader import get_screen_reader_service

def test_screen_reader_singleton():
    s1 = get_screen_reader_service()
    s2 = get_screen_reader_service()
    assert s1 is s2
    assert s1.engine is not None

def test_capture_and_read_screen():
    # Because we don't know what is on the user's screen (or the CI environments), 
    # we just run it and ensure it doesn't crash and returns a string (even an empty one if blank screen).
    service = get_screen_reader_service()
    text = service.capture_and_read_screen()
    
    assert isinstance(text, str)
    # the screen will likely have *some* text on it, but we can't guarantee what it is to assert against.
    # At least assert the function completes.
