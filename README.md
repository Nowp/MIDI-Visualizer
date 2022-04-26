# MIDI Visualizer

## Introduction
This application is a way to feed MIDI realtime stream to shaders to generate pretty images.

## Contribute

Here are the instructions to have a proper development environment.

### Set up a virtual MIDI device (Optional)

If you don't have any MIDI device that is usable on your computer, you will definitely need this for testing.

#### Windows
1) Download a virtual MIDI device ([VMPK](https://vmpk.sourceforge.io/) for example).
2) Download a virtual MIDI cable software. [loopMIDI](https://www.tobias-erichsen.de/software/loopmidi.html) is really 
simple and free.
3) Create a virtual cable in **loopMIDI**.
4) Restart you computer
5) Open **VMPK** and go into Edit->MIDI Connections
6) Disable MIDI Input 
7) Set MIDI output to Windows MM and the output port to your loopMIDI cable
8) Check if when you press some keys on **VMPK** if some data is transferred in the **loopMIDI** panel.

#### Other
The steps should be the same as Windows installation but instead of selecting 'Windows MM', select your MIDI driver.
