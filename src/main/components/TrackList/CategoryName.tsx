import { FC } from "react"
import { categoryEmojis, getCategoryIndex } from "../../../common/midi/GM"
import { Localized } from "../../../components/Localized"

export const CategoryName: FC<{ programNumber: number }> = ({
  programNumber,
}) => {
  switch (getCategoryIndex(programNumber)) {
    case 0:
      return <Localized default="Piano">Piano</Localized>
    case 1:
      return (
        <Localized default="Chromatic Percussion">
          Chromatic Percussion
        </Localized>
      )
    case 2:
      return <Localized default="Organ">Organ</Localized>
    case 3:
      return <Localized default="Guitar">Guitar</Localized>
    case 4:
      return <Localized default="Bass">Bass</Localized>
    case 5:
      return <Localized default="Strings">Strings</Localized>
    case 6:
      return <Localized default="Ensemble">Ensemble</Localized>
    case 7:
      return <Localized default="Brass">Brass</Localized>
    case 8:
      return <Localized default="Reed">Reed</Localized>
    case 9:
      return <Localized default="Pipe">Pipe</Localized>
    case 10:
      return <Localized default="Synth Lead">Synth Lead</Localized>
    case 11:
      return <Localized default="Synth Pad">Synth Pad</Localized>
    case 12:
      return <Localized default="Synth Effects">Synth Effects</Localized>
    case 13:
      return <Localized default="Ethnic">Ethnic</Localized>
    case 14:
      return <Localized default="Percussive">Percussive</Localized>
    case 15:
      return <Localized default="Sound effects">Sound effects</Localized>
  }
  return <></>
}

export const FancyCategoryName: FC<{ programNumber: number }> = ({
  programNumber,
}) => {
  const emoji = categoryEmojis[getCategoryIndex(programNumber)]
  return (
    <>
      {emoji} <CategoryName programNumber={programNumber} />
    </>
  )
}
