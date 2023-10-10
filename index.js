(function() {
    const noteFreqs = {
        "g#2": 207.65,
        "a3": 220,
        "a#3": 233.08,
        "b3": 249.94,
        "c3": 261.63,
        "c#3": 277.18,
        "d3": 293.66,
        "d#3": 311.13,
        "e3": 329.63,
        "f3": 349.23,
        "f#3": 369.99,
        "g3": 392,
        "g#3": 415.3,
        "a4": 440,
        "a#4": 466.16
    };

    const keyToNote = {
        "KeyA": "a3",
        "KeyW": "a#3",
        "KeyS": "b3",
        "KeyD": "c3",
        "KeyR": "c#3",
        "KeyF": "d3",
        "KeyT": "d#3",
        "KeyG": "e3",
        "KeyH": "f3",
        "KeyU": "f#3",
        "KeyJ": "g3",
        "KeyI": "g#3",
        "KeyK": "a4"
    };

    let mDown = null;
    const nPlaying = {};

    const audioCtx = new AudioContext();
    const masterGain = new GainNode(audioCtx);
    masterGain.gain.value = 0.25;
    masterGain.connect(audioCtx.destination);
    const oscs = {};
    const gains = {};
    let releaseTime = 1;

    function startOsc(n) {
        if (!(n in nPlaying)) {
            nPlaying[n] = false;
        }

        if (!nPlaying[n]) {
            oscs[n] = new OscillatorNode(audioCtx, {
                frequency: noteFreqs[n],
                type: "sine"
            });
            gains[n] = new GainNode(audioCtx);
            const time = audioCtx.currentTime;
            oscs[n].connect(gains[n]).connect(masterGain);
            oscs[n].start(time);
            document.querySelector('[id="' + n + '"]').classList.add("key-selected");
            nPlaying[n] = true;
        }
    }

    function stopOsc(n) {
        const time = audioCtx.currentTime;
        gains[n].gain.exponentialRampToValueAtTime(0.01, time + releaseTime);
        oscs[n].stop(time + releaseTime);
        nPlaying[n] = false;
        document.querySelector('[id="' + n + '"]').classList.remove("key-selected");
    }

    window.addEventListener("keydown", (event) => {
        if (event.isComposing) {
            return;
        }

        if (audioCtx.state === "suspended") {
            audioCtx.resume();
        }
        
        const k = event.code;
        if (k in keyToNote) {
            startOsc(keyToNote[k]);
        }
    });

    window.addEventListener("keyup", (event) => {
        if (event.isComposing) {
            return;
        }
        const k = event.code;
        if (k in keyToNote) {
            stopOsc(keyToNote[k]);
        }
    });

    function addKeyClickEvents(kType) {
        const paths = document.querySelector('#' + kType + '-key-paths').childNodes;
        paths.forEach(function(path) {
            path.addEventListener('mousedown', function() {
                mDown = path.id;
                startOsc(path.id);
            });
        });
    }
    addKeyClickEvents('white');
    addKeyClickEvents('black');

    window.addEventListener('mouseup', function() {
        if (mDown !== null)
            stopOsc(mDown);
    });
})();