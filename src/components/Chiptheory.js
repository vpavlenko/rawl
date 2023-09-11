import React from 'react';

const Chiptheory = (chiptheory) => {
    return <div style={{ width: '96%', height: '100%', marginTop: '1em', padding: '1em', backgroundColor: 'black' }}>
        <h1>Chiptheory</h1>
        <div>Add a tag:{" "}
            <input type="text" />
        </div>
        <div>p1: {JSON.stringify(chiptheory)}</div>
    </div>
}

export default Chiptheory;