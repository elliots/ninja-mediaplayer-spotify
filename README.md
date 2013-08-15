ninja-mediaplayer-spotify
===============

A driver that exposes a local spotify client running on OSX as a MediaPlayer device on NinjaBlocks

## Usage

You can send commands to the player with a payload like this
```
{
    command: 'jumpTo',
    args: [128]
}
```
The available commands are :

- playTrack(uri)
- jumpTo(second)
- play
- pause
- playPause
- next
- previous
- volumeUp
- volumeDown
- setVolume(volume)
- unmute

## Changelog

v0.0.3

Bump up the poll interval from 300ms to 1000ms due to crazy CPU usage in the applescript.

v0.0.2

Grab the cover art url another way...

## License

Copyright (C) 2013 Ninja Blocks Inc

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

