// Theme selector button

const toggleVisibility = id => {
    const element = document.getElementById(id);
    element.classList.toggle("hidden");
    element.classList.toggle("visible");
};

const themeDropdownButton = document.getElementById('theme-selector-button');
themeDropdownButton.addEventListener('click', e => {
    e.preventDefault();

    toggleVisibility('theme-selector-dropdown');
});


const lightThemeSelector = document.getElementById('light-theme');
const darkThemeSelector = document.getElementById('dark-theme');

darkThemeSelector.addEventListener('click', e => {
    e.preventDefault();

    document.querySelector('body').classList.remove('light-theme');
    document.querySelector('body').classList.add('dark-theme');
});

lightThemeSelector.addEventListener('click', e => {
    e.preventDefault();

    document.querySelector('body').classList.remove('dark-theme');
    document.querySelector('body').classList.add('light-theme');
});

// Video recording

const API_KEY = 'KL15HIYDgw5jAPCqW0b1eh4El9QJy8wk';

const computeUploadUrl = _ => 
    `http://upload.giphy.com/v1/gifs?api_key=${API_KEY}`;


const video = document.querySelector('video');

let recordingStart = 0;
let recordingEnd = 0;

const startTimingRecording = _ => {
  recordingStart = performance.now();
};

const endTimingRecording = _ => {
  recordingEnd = performance.now();
  return recordingEnd - recordingStart; //in ms 
}

const startStream = _ =>
    navigator.mediaDevices.getUserMedia({ 
        audio: false,
        video: {
            width: 830,
            height: 430
        } 
    });

const createFileFromBlob = blob => { 
    console.log("RECIBIDO BLOB");
    const form = new FormData();
    form.append('file', blob, 'myGif.gif');
    return form;
};

// POST a la API de Giphy para subir los gifs capturados
// LocalStorage para guardar datos y generar galería en ‘Mis GifOS’.
// localStorage.setItem(nombre de lo que queremos guardar, información)
// debido a limitaciones del browser la información deberá ser guardada en formato string
// localStorage.getItem(keys de los items que queremos obtener)
// Local Storage es una lista, y como tal puede ser recorrida con bucles
// ver resultado en Application -> localstorage. 

let recorder;
let videoDurationInMs = 0;

const startRecording = _ => {
    startStream()
        .then(stream => {
            recorder = new RecordRTCPromisesHandler(stream, { type: 'video' })
            return recorder;
        })
        .then(startedRecorder => {
            startTimingRecording();
            return startedRecorder.startRecording();
        });
};

let gifFile;

const stopRecording = _ => {
    return recorder.stopRecording()
        .then(() => {
            videoDurationInMs = endTimingRecording();
            return recorder.getBlob();
        })
        .then(blob => {
            video.srcObject = null;
            video.src = createUrlFromBlob(blob);
            startProgressBar(videoDurationInMs);
            return blob;
        })
        .then(blob => { console.log("BLOB??", blob);gifFile = createFileFromBlob(blob);} )
        .catch(e => console.log(e));
};

const createUrlFromBlob = blob => URL.createObjectURL(blob);

const timeKeeper = fn => {
    const timingInformation = {
        minutes: 0,
        seconds: 0
    };

    let ellapsedSeconds = 0;

    return setInterval(() => {
        ellapsedSeconds++;

        if (Math.floor(ellapsedSeconds / 60) === 1) {
            timingInformation.minutes++;
            ellapsedSeconds = 0;
        }

        timingInformation.seconds = ellapsedSeconds % 60;

        fn(timingInformation);
    }, 1000);
};

const formatTimer = (minutes, seconds) => {
    let paddedMinutes = minutes.toString().padStart(2, "0");
    let paddedSeconds = seconds.toString().padStart(2, "0");

    return `00:00:${paddedMinutes}:${paddedSeconds}`;
};

const updateTimers = timingInfo => {
    const formattedTimer = formatTimer(timingInfo.minutes, timingInfo.seconds);

    gifCreationTimers().forEach(timerElement => timerElement.innerText = formattedTimer);
};

const restartTimers = _ => {
    gifCreationTimers().forEach(timerElement => timerElement.innerText = '00:00:00:00');
};

const startTimers = _ => {
    restartTimers();
    return timeKeeper(info => updateTimers(info));
};

// Buttons
const gifCreationStartButton = document.getElementById('gif-creation-start-button');
const gifCreationStartProcessButton = document.getElementById('gif-creation-start-process-button');
const gifCreationStartRecordingButton = document.getElementById('gif-creation-start-recording-button');
const gifCreationStopRecordingButton = document.getElementById('gif-creation-stop-recording-button');
const gifCreationRefreshRecordingButton = document.getElementById('gif-creation-refresh-recording-button');
const gifCreationUploadRecordingButton = document.getElementById('gif-creation-upload-recording-button');

const gifCreationPlayVideoButton = document.getElementById('gif-creation-play-video-button');


// Containers
const gifCreationInstructionsContainer = document.getElementById('gif-creation-instructions-container');
const gifCreationRecordingContainer = document.getElementById('gif-creation-recording-container');
const gifCreationCompletedContainer = document.getElementById('gif-creation-completed-container');

// Elements Array
const getGifCreationElementsAtStart = _ => 
    Array.from(document.getElementsByClassName('show-on-gif-creation-start'));

const getGifCreationCancelButtons = _ => 
    Array.from(document.getElementsByClassName('gif-creation-cancel'));

const getGifCreationElements = _ =>
    Array.from(document.getElementsByClassName('gif-creation'));

// Steps
const gifCreationRecordingStep2 = _ =>
    Array.from(document.getElementsByClassName('gif-creation-recording-step-2'));

const gifCreationRecordingStep3 = _ =>
    Array.from(document.getElementsByClassName('gif-creation-recording-step-3'));

const gifCreationRecordingStep4 = _ =>
    Array.from(document.getElementsByClassName('gif-creation-recording-step-4'));

const gifCreationRecordingStep5 = _ =>
    Array.from(document.getElementsByClassName('gif-creation-recording-step-5'));

    
// Timers
const gifCreationTimers = _ => 
    Array.from(document.getElementsByClassName('gif-creation-recording-timer'));

// Events binding

gifCreationStartButton.addEventListener('click', e => {
    e.preventDefault();

    getGifCreationElementsAtStart().forEach(element => {
        element.classList.remove('hidden');
    });
});

getGifCreationCancelButtons().forEach(element => element.addEventListener('click', e => {
    e.preventDefault();

    getGifCreationElements().forEach(element => {
        element.classList.add('hidden');
    });
}));

gifCreationStartProcessButton.addEventListener('click', e => {
    e.preventDefault();

    gifCreationInstructionsContainer.classList.add('hidden');
    gifCreationRecordingContainer.classList.remove('hidden');

    startStream().then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = e => video.play();
    });
});

let timeKeeperSetInterval;


gifCreationStartRecordingButton.addEventListener('click', e => {
    e.preventDefault();
    
    gifCreationRecordingStep2().forEach(element => {
        element.classList.add('hidden');
    });

    gifCreationRecordingStep3().forEach(element => {
        element.classList.remove('hidden');
    });

    timeKeeperSetInterval = startTimers();

    startRecording();
});

gifCreationStopRecordingButton.addEventListener('click', e => {
    e.preventDefault();
    
    gifCreationRecordingStep3().forEach(element => {
        element.classList.add('hidden');
    });

    gifCreationRecordingStep4().forEach(element => {
        element.classList.remove('hidden');
    });

    clearInterval(timeKeeperSetInterval);

    stopRecording();
});

gifCreationRefreshRecordingButton.addEventListener('click', e => {
    e.preventDefault();
    
    gifCreationRecordingStep4().forEach(element => {
        element.classList.add('hidden');
    });

    gifCreationRecordingStep2().forEach(element => {
        element.classList.remove('hidden');
    });

    timeKeeperSetInterval = startTimers();

    startRecording();

    startStream().then(stream => {
        video.srcObject = stream;
        video.onloadedmetadata = e => video.play();
    });
});

gifCreationUploadRecordingButton.addEventListener('click', e => {
    e.preventDefault();
    
    gifCreationRecordingStep4().forEach(element => {
        element.classList.add('hidden');
    });

    gifCreationRecordingStep5().forEach(element => {
        element.classList.remove('hidden');
    });
});

gifCreationPlayVideoButton.addEventListener('click', e => {
    e.preventDefault();
    video.play();
    startProgressBar(videoDurationInMs);
});

const createProgressBarTick = tickNumber => {
    const progressBarTickElement = document.createElement('span');
    progressBarTickElement.classList.add("progress-bar-tick");
    progressBarTickElement.id = `progress-bar-${tickNumber}`;
    return progressBarTickElement;
};

const createTicksBar = tickBarNumber => {
    const elements = [];
    for (let i = 0; i < tickBarNumber; i++) {
        elements.push(createProgressBarTick(i));
    }

    return elements;
};

const barsNumber = 17;

const progressBarElement = document.getElementById('gif-creation-player-progress-bar');

const ticksBar = createTicksBar(barsNumber);

ticksBar.forEach(element => progressBarElement.appendChild(element));

const restartProgressBar = _ =>
    ticksBar.forEach(element => element.classList.remove('colored-tick'));

function startProgressBar(duration) {
    const eachBarDuration = duration / barsNumber;

    let counter = 0;
    const interval = setInterval(() => {
        counter++;
        ticksBar[counter - 1].classList.add('colored-tick');

        if (counter === barsNumber) {
            counter = 0;
            clearInterval(interval);
            // Para hacer una breve pausa, sino no se ve el ultimo tick pintado.
            setTimeout(() => restartProgressBar(), 500);
        }
    }, eachBarDuration);
}


document.getElementById('gif-creation-upload-recording-button').addEventListener('click', e => {
    e.preventDefault();

    if (gifFile) {
        fetch(computeUploadUrl(), {
            method: 'POST',
            mode: 'cors',
            body: gifFile
        }).then(r => r.json()).then(console.log);
    }
});