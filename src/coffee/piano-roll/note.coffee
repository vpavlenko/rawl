{
  frameToPixel: frameToPixel
  noteNumberToPixel: noteNumberToPixel
} = require "../helpers/NoteHelper.coffee"

getSoundOutput = -> document.sound.soundOutput

flashClass = (elem, className) ->
  elem.classList.add className
  setTimeout -> elem.classList.remove className , 100

PianoRollNote = React.createClass
  _onMouseDown: ->
    getSoundOutput().send @props.note

  _onDragStart: (e) -> 
    e.dataTransfer.effectAllowed = "move"
    dragIcon = document.createElement "img"
    e.dataTransfer.setDragImage dragIcon, 0, 0
    bounds = @getDOMNode().getBoundingClientRect()
    @dragStartPosision = 
      x: e.pageX - bounds.left
      y: e.pageY - bounds.top

  _onDrag: (e) -> 
    @props.onDrag e, @, @dragStartPosision

  componentDidMount: ->
    flashClass @getDOMNode(), "debug_did_mount"

  componentDidUpdate: ->
    flashClass @getDOMNode(), "debug_did_update"

  shouldComponentUpdate: (nextProps, nextState) ->
    not @props.note.equals nextProps.note

  render: ->
    width = Math.max 1, frameToPixel(@props.note.duration)
    style = 
      width: width
      backgroundColor: "rgba(62, 78, 238, #{@props.note.velocity / 128})"
      left: frameToPixel(@props.note.frame)
      top: noteNumberToPixel(@props.note.noteNumber)

    headStyle = 
      width: if width > 6 then 3 else 1

    bodyStyle = 
      width: width - headStyle.width * 2

    <div className="PianoRollNote" style={style} onDrag={@_onDrag} onDragStart={@_onDragStart} onMouseDown={@_onMouseDown}>
      <div className="head" style={headStyle} />
      <div className="body" style={bodyStyle} />
      <div className="tail" style={headStyle} />
    </div>

module.exports = PianoRollNote
