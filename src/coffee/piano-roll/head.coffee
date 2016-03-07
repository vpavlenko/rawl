AppConstants = require "../constants/AppConstants.coffee"

keyColors = ["white", "black", "white", "black", "white", "white", "black", "white", "black", "white", "black", "white"]

getSoundOutput = -> document.sound.soundOutput

PianoRollKey = React.createClass
  onClick: ->
    getSoundOutput().send
      noteNumber: @props.noteNumber
      velocity: 100
      duration: AppConstants.timebase

  render: ->
      style =
        height: AppConstants.keyHeight

      className = "key #{keyColors[@props.noteNumber % keyColors.length]}"
      className += " bordered" if @props.noteNumber % 12 is 4 or @props.noteNumber % 12 is 11
      <div className={className} onClick={@onClick} style={style}>
        <div className="inner" />
      </div>

PianoRollHead = React.createClass
  onScroll: (e) ->
    left = e.target.scrollLeft
    @getDOMNode().style.left = left + "px"

  render: ->

    keys =
      (for i in [0..AppConstants.highestNoteNumber]
        <PianoRollKey noteNumber={i} />
      )

    keys = keys.reverse()

    <div className="PianoRollHead">
      {keys}
    </div>

module.exports = PianoRollHead
