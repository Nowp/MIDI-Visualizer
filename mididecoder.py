import rtmidi


class MidiInputDevice:
    """ Represents the Input stream with a MIDI device """
    def __init__(self):
        self.midiin = rtmidi.MidiIn()
        self.initialize_midi()

    def initialize_midi(self):
        """ Function initializing the stream with the MIDI device """
        available_ports = self.midiin.get_ports()

        if available_ports:
            self.midiin.open_port()
        else:
            print("No MIDI port available")
            del self.midiin

    def get_message(self):
        """ Returns the message currently in the input buffer composed by the data and a delta time"""
        return self.midiin.get_message()
