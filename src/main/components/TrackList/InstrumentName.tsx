import { observer } from "mobx-react-lite"
import { FC } from "react"
import Track from "../../../common/track/Track"
import { Localized } from "../../../components/Localized"

export const InstrumentName: FC<{ programNumber: number | undefined }> = ({
  programNumber,
}) => {
  switch (programNumber) {
    case 0:
      return (
        <Localized default="Acoustic Grand Piano">
          Acoustic Grand Piano
        </Localized>
      )
    case 1:
      return (
        <Localized default="Bright Acoustic Piano">
          Bright Acoustic Piano
        </Localized>
      )
    case 2:
      return (
        <Localized default="Electric Grand Piano">
          Electric Grand Piano
        </Localized>
      )
    case 3:
      return <Localized default="Honky-tonk Piano">Honky-tonk Piano</Localized>
    case 4:
      return <Localized default="Electric Piano 1">Electric Piano 1</Localized>
    case 5:
      return <Localized default="Electric Piano 2">Electric Piano 2</Localized>
    case 6:
      return <Localized default="Harpsichord">Harpsichord</Localized>
    case 7:
      return <Localized default="Clavinet">Clavinet</Localized>
    case 8:
      return <Localized default="Celesta">Celesta</Localized>
    case 9:
      return <Localized default="Glockenspiel">Glockenspiel</Localized>
    case 10:
      return <Localized default="Music Box">Music Box</Localized>
    case 11:
      return <Localized default="Vibraphone">Vibraphone</Localized>
    case 12:
      return <Localized default="Marimba">Marimba</Localized>
    case 13:
      return <Localized default="Xylophone">Xylophone</Localized>
    case 14:
      return <Localized default="Tubular Bells">Tubular Bells</Localized>
    case 15:
      return <Localized default="Dulcimer">Dulcimer</Localized>
    case 16:
      return <Localized default="Drawbar Organ">Drawbar Organ</Localized>
    case 17:
      return <Localized default="Percussive Organ">Percussive Organ</Localized>
    case 18:
      return <Localized default="Rock Organ">Rock Organ</Localized>
    case 19:
      return <Localized default="Church Organ">Church Organ</Localized>
    case 20:
      return <Localized default="Reed Organ">Reed Organ</Localized>
    case 21:
      return <Localized default="Accordion">Accordion</Localized>
    case 22:
      return <Localized default="Harmonica">Harmonica</Localized>
    case 23:
      return <Localized default="Tango Accordion">Tango Accordion</Localized>
    case 24:
      return (
        <Localized default="Acoustic Guitar (nylon)">
          Acoustic Guitar (nylon)
        </Localized>
      )
    case 25:
      return (
        <Localized default="Acoustic Guitar (steel)">
          Acoustic Guitar (steel)
        </Localized>
      )
    case 26:
      return (
        <Localized default="Electric Guitar (jazz)">
          Electric Guitar (jazz)
        </Localized>
      )
    case 27:
      return (
        <Localized default="Electric Guitar (clean)">
          Electric Guitar (clean)
        </Localized>
      )
    case 28:
      return (
        <Localized default="Electric Guitar (muted)">
          Electric Guitar (muted)
        </Localized>
      )
    case 29:
      return (
        <Localized default="Overdriven Guitar">Overdriven Guitar</Localized>
      )
    case 30:
      return (
        <Localized default="Distortion Guitar">Distortion Guitar</Localized>
      )
    case 31:
      return <Localized default="Guitar Harmonics">Guitar Harmonics</Localized>
    case 32:
      return <Localized default="Acoustic Bass">Acoustic Bass</Localized>
    case 33:
      return (
        <Localized default="Electric Bass (finger)">
          Electric Bass (finger)
        </Localized>
      )
    case 34:
      return (
        <Localized default="Electric Bass (pick)">
          Electric Bass (pick)
        </Localized>
      )
    case 35:
      return <Localized default="Fretless Bass">Fretless Bass</Localized>
    case 36:
      return <Localized default="Slap Bass 1">Slap Bass 1</Localized>
    case 37:
      return <Localized default="Slap Bass 2">Slap Bass 2</Localized>
    case 38:
      return <Localized default="Synth Bass 1">Synth Bass 1</Localized>
    case 39:
      return <Localized default="Synth Bass 2">Synth Bass 2</Localized>
    case 40:
      return <Localized default="Violin">Violin</Localized>
    case 41:
      return <Localized default="Viola">Viola</Localized>
    case 42:
      return <Localized default="Cello">Cello</Localized>
    case 43:
      return <Localized default="Contrabass">Contrabass</Localized>
    case 44:
      return <Localized default="Tremolo Strings">Tremolo Strings</Localized>
    case 45:
      return (
        <Localized default="Pizzicato Strings">Pizzicato Strings</Localized>
      )
    case 46:
      return <Localized default="Orchestral Harp">Orchestral Harp</Localized>
    case 47:
      return <Localized default="Timpani">Timpani</Localized>
    case 48:
      return (
        <Localized default="String Ensemble 1">String Ensemble 1</Localized>
      )
    case 49:
      return (
        <Localized default="String Ensemble 2">String Ensemble 2</Localized>
      )
    case 50:
      return <Localized default="Synth Strings 1">Synth Strings 1</Localized>
    case 51:
      return <Localized default="Synth Strings 2">Synth Strings 2</Localized>
    case 52:
      return <Localized default="Choir Aahs">Choir Aahs</Localized>
    case 53:
      return <Localized default="Voice Oohs">Voice Oohs</Localized>
    case 54:
      return <Localized default="Synth Choir">Synth Choir</Localized>
    case 55:
      return <Localized default="Orchestra Hit">Orchestra Hit</Localized>
    case 56:
      return <Localized default="Trumpet">Trumpet</Localized>
    case 57:
      return <Localized default="Trombone">Trombone</Localized>
    case 58:
      return <Localized default="Tuba">Tuba</Localized>
    case 59:
      return <Localized default="Muted Trumpet">Muted Trumpet</Localized>
    case 60:
      return <Localized default="French Horn">French Horn</Localized>
    case 61:
      return <Localized default="Brass Section">Brass Section</Localized>
    case 62:
      return <Localized default="Synth Brass 1">Synth Brass 1</Localized>
    case 63:
      return <Localized default="Synth Brass 2">Synth Brass 2</Localized>
    case 64:
      return <Localized default="Soprano Sax">Soprano Sax</Localized>
    case 65:
      return <Localized default="Alto Sax">Alto Sax</Localized>
    case 66:
      return <Localized default="Tenor Sax">Tenor Sax</Localized>
    case 67:
      return <Localized default="Baritone Sax">Baritone Sax</Localized>
    case 68:
      return <Localized default="Oboe">Oboe</Localized>
    case 69:
      return <Localized default="English Horn">English Horn</Localized>
    case 70:
      return <Localized default="Bassoon">Bassoon</Localized>
    case 71:
      return <Localized default="Clarinet">Clarinet</Localized>
    case 72:
      return <Localized default="Piccolo">Piccolo</Localized>
    case 73:
      return <Localized default="Flute">Flute</Localized>
    case 74:
      return <Localized default="Recorder">Recorder</Localized>
    case 75:
      return <Localized default="Pan Flute">Pan Flute</Localized>
    case 76:
      return <Localized default="Blown Bottle">Blown Bottle</Localized>
    case 77:
      return <Localized default="Shakuhachi">Shakuhachi</Localized>
    case 78:
      return <Localized default="Whistle">Whistle</Localized>
    case 79:
      return <Localized default="Ocarina">Ocarina</Localized>
    case 80:
      return <Localized default="Lead 1 (square)">Lead 1 (square)</Localized>
    case 81:
      return (
        <Localized default="Lead 2 (sawtooth)">Lead 2 (sawtooth)</Localized>
      )
    case 82:
      return (
        <Localized default="Lead 3 (calliope)">Lead 3 (calliope)</Localized>
      )
    case 83:
      return <Localized default="Lead 4 (chiff)">Lead 4 (chiff)</Localized>
    case 84:
      return <Localized default="Lead 5 (charang)">Lead 5 (charang)</Localized>
    case 85:
      return <Localized default="Lead 6 (voice)">Lead 6 (voice)</Localized>
    case 86:
      return <Localized default="Lead 7 (fifths)">Lead 7 (fifths)</Localized>
    case 87:
      return (
        <Localized default="Lead 8 (bass + lead)">
          Lead 8 (bass + lead)
        </Localized>
      )
    case 88:
      return <Localized default="Pad 1 (new age)">Pad 1 (new age)</Localized>
    case 89:
      return <Localized default="Pad 2 (warm)">Pad 2 (warm)</Localized>
    case 90:
      return (
        <Localized default="Pad 3 (polysynth)">Pad 3 (polysynth)</Localized>
      )
    case 91:
      return <Localized default="Pad 4 (choir)">Pad 4 (choir)</Localized>
    case 92:
      return <Localized default="Pad 5 (bowed)">Pad 5 (bowed)</Localized>
    case 93:
      return <Localized default="Pad 6 (metallic)">Pad 6 (metallic)</Localized>
    case 94:
      return <Localized default="Pad 7 (halo)">Pad 7 (halo)</Localized>
    case 95:
      return <Localized default="Pad 8 (sweep)">Pad 8 (sweep)</Localized>
    case 96:
      return <Localized default="FX 1 (rain)">FX 1 (rain)</Localized>
    case 97:
      return (
        <Localized default="FX 2 (soundtrack)">FX 2 (soundtrack)</Localized>
      )
    case 98:
      return <Localized default="FX 3 (crystal)">FX 3 (crystal)</Localized>
    case 99:
      return (
        <Localized default="FX 4 (atmosphere)">FX 4 (atmosphere)</Localized>
      )
    case 100:
      return (
        <Localized default="FX 5 (brightness)">FX 5 (brightness)</Localized>
      )
    case 101:
      return <Localized default="FX 6 (goblins)">FX 6 (goblins)</Localized>
    case 102:
      return <Localized default="FX 7 (echoes)">FX 7 (echoes)</Localized>
    case 103:
      return <Localized default="FX 8 (sci-fi)">FX 8 (sci-fi)</Localized>
    case 104:
      return <Localized default="Sitar">Sitar</Localized>
    case 105:
      return <Localized default="Banjo">Banjo</Localized>
    case 106:
      return <Localized default="Shamisen">Shamisen</Localized>
    case 107:
      return <Localized default="Koto">Koto</Localized>
    case 108:
      return <Localized default="Kalimba">Kalimba</Localized>
    case 109:
      return <Localized default="Bagpipe">Bagpipe</Localized>
    case 110:
      return <Localized default="Fiddle">Fiddle</Localized>
    case 111:
      return <Localized default="Shanai">Shanai</Localized>
    case 112:
      return <Localized default="Tinkle Bell">Tinkle Bell</Localized>
    case 113:
      return <Localized default="Agogo">Agogo</Localized>
    case 114:
      return <Localized default="Steel Drums">Steel Drums</Localized>
    case 115:
      return <Localized default="Woodblock">Woodblock</Localized>
    case 116:
      return <Localized default="Taiko Drum">Taiko Drum</Localized>
    case 117:
      return <Localized default="Melodic Tom">Melodic Tom</Localized>
    case 118:
      return <Localized default="Synth Drum">Synth Drum</Localized>
    case 119:
      return <Localized default="Reverse Cymbal">Reverse Cymbal</Localized>
    case 120:
      return (
        <Localized default="Guitar Fret Noise">Guitar Fret Noise</Localized>
      )
    case 121:
      return <Localized default="Breath Noise">Breath Noise</Localized>
    case 122:
      return <Localized default="Seashore">Seashore</Localized>
    case 123:
      return <Localized default="Bird Tweet">Bird Tweet</Localized>
    case 124:
      return <Localized default="Telephone Ring">Telephone Ring</Localized>
    case 125:
      return <Localized default="Helicopter">Helicopter</Localized>
    case 126:
      return <Localized default="Applause">Applause</Localized>
    case 127:
      return <Localized default="Gunshot">Gunshot</Localized>
  }
  return <></>
}

export const TrackInstrumentName: FC<{ track: Track }> = observer(
  ({ track }) => {
    if (track.isRhythmTrack) {
      return <>Standard Drum Kit</>
    }
    return <InstrumentName programNumber={track.programNumber} />
  },
)
