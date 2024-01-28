import React from "react";

const VolumeSlider = ({ onChange, handleReset, value }) => {
  return (
    <div className="VolumeSlider">
      <span style={{ marginRight: "10px" }}>Vol</span>
      <input
        type="range"
        title="Volume"
        min={0}
        max={150}
        step={1}
        onChange={onChange}
        onDoubleClick={handleReset}
        onContextMenu={handleReset}
        value={value}
      />
    </div>
  );
};

export default React.memo(VolumeSlider);
