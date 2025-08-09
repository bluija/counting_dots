/*
data saved as FirebaseID /
1. pid: Prolific URL parameters
2. exp: experiment-wide data
3. trial: trial data
*/

// constants
const redirectURL = "https://app.prolific.com/submissions/complete?cc=C1P1YP97"

const minDots = 100;
const maxDots = 150;
const dotSize = 15;
const numTrial = 100;

// https://davidmathlogic.com/colorblind/#%23D81B60-%231E88E5-%23FFC107-%23004D40
const clrs = {"Red": "#D81B60", "Blue": "#1E88E5", "Yellow": "#FFC107", "Green": "#004D40"}
const clrsArr = ["Red", "Blue", "Yellow", "Green"]

const expData = {};

// variables
let isIntro

let aiData

let trialData
let maxClr;

let aiClr
let aiCnf

let curTrial = 1;
let curScore = 0;

// consent
const loading = document.querySelector('.loading');

const consent = document.querySelector('.consent');
const consentCheckbox = document.querySelector('.consentCheckbox');
const startButton = document.querySelector('.startButton');

// experiment
const experiment = document.querySelector('.experiment');
const progressDisplay = document.querySelector('.progressDisplay');
const trial = document.querySelector('.trial');
const score = document.querySelector('.score');
const question = document.querySelector('.question');

const questionDisplay = document.querySelector('.questionDisplay');

const beforeForm = document.querySelector('.beforeForm');
const beforeField = document.querySelector('.beforeField');
const beforeSubmit = document.querySelector('.beforeSubmit');

const aiForm = document.querySelector('.aiForm');
const aiField = document.querySelector('.aiField');

const afterForm = document.querySelector('.afterForm');
const afterField = document.querySelector('.afterField');
const afterSubmit = document.querySelector('.afterSubmit');

// canvas
const canvasDisplay = document.querySelector('.canvasDisplay');
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

// complete
const complete = document.querySelector(".complete")

const commentDisplay = document.querySelector(".commentDisplay");
const commentField = document.getElementById("commentField");
const commentSubmit = document.querySelector(".commentSubmit")

const redirectDisplay = document.querySelector(".redirectDisplay");
const redirectButton = document.querySelector(".redirectButton");


// helpers
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const timePassed = () => Math.round(performance.now())

const rndIdx = len => Math.floor(Math.random() * len);

const rndDots = hex => {
    let coords = {}

    let x = rndIdx(canvas.width);
    let y = rndIdx(canvas.height);

    coords.x = x;
    coords.y = y;

    ctx.fillStyle = hex;
    ctx.fillRect(x, y, dotSize, dotSize);

    return coords;
};

const repeatDots = (len, hex) => {
    let coords = []
    for (let i = 0; i < len; i++) {
        coords.push(rndDots(hex));
    }
    return coords;
}

const getData = async () => {
    try {
        const response = await fetch(dataPath);
        if (!response.ok) {
            throw new Error(`Response status: ${response.status}`);
        }

        aiData = await response.json();
    } catch (error) {
        console.error(error.message);
    }
};

const setData = () => {
    trialData = structuredClone(aiData[rndIdx(aiData.length)]);
    trialData.trial = curTrial;

    trialData.maxClr = clrsArr[trialData.maxClr]
    trialData.aiClr = clrsArr[trialData.aiClr]
    trialData.aiCnf = Math.round(trialData.aiCnf * 10) * 10;

    maxClr = trialData.maxClr;
    aiClr = trialData.aiClr;
    aiCnf = trialData.aiCnf;

    let minClrs = structuredClone(clrs)
    delete minClrs[maxClr]

    let coords = {}

    coords[maxClr] = repeatDots(maxDots, clrs[maxClr]);

    for (const [eng, hex] of Object.entries(minClrs)) {
        coords[eng] = repeatDots(minDots, hex)
    }

    trialData.coords = coords;
    console.log(trialData);
}

const resetTrial = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    beforeForm.reset()
    beforeField.disabled = false;
    beforeSubmit.classList.remove("hidden");

    aiForm.reset()
    aiForm.classList.add("hidden");

    afterForm.reset()
    afterField.disabled = false;
    afterForm.classList.add("hidden");
    afterSubmit.classList.remove("hidden");

    canvasDisplay.classList.remove("hidden")
    questionDisplay.classList.add("hidden")

    setData()
}

// events
consentCheckbox.onchange = () => {
    startButton.disabled = !consentCheckbox.checked;
};

// onboarding
startButton.onclick = async () => {
    expData.startTime = Date.now();

    consent.classList.add("hidden");
    experiment.classList.remove("hidden");

    isIntro = true;

    introJs().setOptions({
        exitOnEsc: false, exitOnOverlayClick: false,
        showBullets: false, keyboardNavigation: false,

        steps: [{
            title: 'Welcome',
            intro: '<p>We aim to study the way humans use artificial intelligence (AI) to make decisions. </p>' + '<p>Your results will help us to design better AI assistants.</p>'
        }, {
            title: 'Objective',
            element: question,
            intro: '<p>You will watch an animation and decide which color has the most dots with the help of an AI.</p>'
        }, {
            title: 'Stimulus',
            element: canvasDisplay,
            intro: '<p>There are 4 dot colors in the animation.</p>' + '<p>The animation stops after 3 seconds.</p>'
        }, {
            title: 'AI Assistant',
            intro: '<p>The AI will watch the animation with you.</p>' + '<p>However, the AI is trained on static images rather than the animation you are watching now.</p>' + '<p>Therefore, the AI can advise you, but it is not always right.</p>'
        }, {
            title: 'Your Initial Answer',
            element: beforeForm,
            intro: '<p>First, give your answer by selecting the color with the most dots.</p>' + '<p>Then rate your confidence between 0 and 100, where 0 means purely guessing and 100 means totally certain.</p>'
        }, {
            title: 'AI\'s Answer',
            element: aiForm,
            intro: '<p>Then the AI will give you its answer and confidence.</p>' + '<p>It is usually helpful, but may not always get it right.</p>',
        }, {
            title: 'Your Final Answer',
            element: afterForm,
            intro: '<p>After getting the AI\'s advice, answer the question again.</p>'
        }, {
            title: 'Feedback',
            intro: '<p>Get the final question right, and your score will +1.</p>' + '<p>If you are wrong, the correct answer will be shown.</p>'
        }, {
            title: 'Trial',
            element: trial,
            intro: '<p>The progress will be shown on the top left.</p>' + '<p>It shows the current trial/total trials.</p>'
        }, {
            title: 'Score',
            element: score,
            intro: '<p>Your score will be shown on the top right.</p>' + '<p>It shows the number of questions you\'ve answered correctly/total number of questions.</p>'
        }, {
            title: 'Reminder',
            intro: '<p>The AI is sometimes right and sometimes wrong.</p>' + '<p>Your aim is to learn to use the AI to maximize your score.</p>'
        }, {
            title: 'Start', intro: 'Let\'s begin the experiment!',
        }]
    }).onchange((ele) => {
        if (ele === canvasDisplay) {
            canvas.classList.add("slide-in");
        }

        if (ele === beforeForm) {
            canvasDisplay.classList.add("hidden")
            questionDisplay.classList.remove("hidden")
        }

        if (ele === aiForm) {
            aiForm.classList.remove("hidden");

            document.getElementById(`ai${maxClr}`).checked = true;
            document.getElementById(`ai${50}`).checked = true;
        }

        if (ele === afterForm) {
            afterForm.classList.remove("hidden");
        }
    }).oncomplete(() => {
        isIntro = false;
        resetTrial();
    }).start();
}


canvas.onanimationend = () => {
    if (!isIntro) {
        trialData.startTime = timePassed()

        canvasDisplay.classList.add("hidden")
        questionDisplay.classList.remove("hidden")
    }
}

beforeForm.onsubmit = async event => {
    trialData.beforeTime = timePassed()

    event.preventDefault();
    beforeField.disabled = true;

    if (!isIntro) {
        let beforeClr = document.querySelector('input[name="beforeClr"]:checked').value;
        trialData.beforeClr = beforeClr;

        let beforeCnf = document.querySelector('input[name="beforeCnf"]:checked').value;
        trialData.beforeCnf = beforeCnf;

        beforeSubmit.classList.add("hidden");

        aiForm.classList.remove("hidden");
        await sleep(1000);
        document.getElementById(`ai${aiClr}`).checked = true;
        await sleep(1000);
        document.getElementById(`ai${aiCnf}`).checked = true;
        await sleep(1000);

        afterForm.classList.remove("hidden");
        trialData.aiTime = timePassed()
    }
}

afterForm.onsubmit = async event => {
    trialData.afterTime = timePassed()

    event.preventDefault();
    afterField.disabled = true;

    if (!isIntro) {
        let afterClr = document.querySelector('input[name="afterClr"]:checked').value;
        trialData.afterClr = afterClr;

        let afterCnf = document.querySelector('input[name="afterCnf"]:checked').value;
        trialData.afterCnf = afterCnf;

        afterSubmit.classList.add("hidden");

        let title
        let descr

        if (afterClr.toLowerCase() === maxClr.toLowerCase()) {
            curScore++
            trialData.correct = true

            title = "&#x2714; Correct"
            descr = "Your score increased by 1!"
        } else {
            trialData.correct = false

            title = "&#x2718; Wrong"
            descr = "The correct answer is " + maxClr
        }

        score.textContent = `Score: ${curScore}/${curTrial} (${Math.round(curScore / curTrial * 100)}%)`;
        trialData.endTime = timePassed()


        introJs().setOptions({
            exitOnEsc: false, exitOnOverlayClick: false, showBullets: false, keyboardNavigation: false, steps: [{
                title: title, intro: descr
            }]
        }).oncomplete(() => {
            curTrial++
            trial.textContent = `Trial: ${curTrial}/${numTrial} (${Math.round(curTrial / numTrial * 100)}%)`;

            if (curTrial <= numTrial) {
                resetTrial()

            } else {
                expData.score = curScore;

                experiment.classList.add("hidden");
                complete.classList.remove("hidden");
            }
        }).start();
    }
}

commentSubmit.onclick = async () => {
    expData.comment = commentField.value;
    expData.endTime = Date.now();

    console.log("Wrote to database");

    commentDisplay.classList.add("hidden");
    redirectDisplay.classList.remove("hidden");

    await sleep(3000);
    window.location.replace(redirectURL)
}

redirectButton.onclick = () => {
    window.location.replace(redirectURL)
}

// initialize

const condition = 0
expData.condition = condition;

const dataPath = `data${expData.condition}.json`;
console.log(expData.condition);

getData().then(() => setData())

trial.textContent = `Trial: 1/${numTrial} (${Math.round(1 / numTrial * 100)}%)`;
score.textContent = `Score: 0/0 (0%)`;

loading.classList.add('hidden');
consent.classList.remove('hidden');
