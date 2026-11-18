/* =========================================================
   BETWEEN AISHI — INTERACTION SYSTEM 2.0 (ULTRA ANIMATED)
   Login • Loading Transition • Welcome • Letters • Feeling Jars • Jar Library
   Photo Archive • Accessible motion • Local persistence • Cinema Motion & Music
========================================================= */

"use strict";

/* ---------- Small utilities ---------- */

const $ = (selector, parent = document) => parent.querySelector(selector);
const $$ = (selector, parent = document) => [...parent.querySelectorAll(selector)];

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function setHidden(element, hidden) {
    if (element) element.hidden = hidden;
}

function safelyReadStorage(key, fallback) {
    try {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : fallback;
    } catch (error) {
        console.warn(`Could not read ${key} from local storage.`, error);
        return fallback;
    }
}

function safelyWriteStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`Could not save ${key} to local storage.`, error);
        return false;
    }
}

function animateIn(element, className = "screen-enter") {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    element.addEventListener("animationend", () => {
        element.classList.remove(className);
    }, { once: true });
}

function changeScreen(from, to) {
    if (!from || !to) {
        console.error("changeScreen failed: 'from' or 'to' element is missing.", { from, to });
        return;
    }
    from.hidden = true;
    to.hidden = false;
    animateIn(to);
    scrollToTop();
}

function makeParagraphs(container, paragraphs) {
    if (!container) return;
    container.replaceChildren();
    paragraphs.forEach((text) => {
        const paragraph = document.createElement("p");
        paragraph.textContent = text;
        container.appendChild(paragraph);
    });
}

/* ---------- Loading introduction (Safe & Fast Dismiss) ---------- */

const loadingScreen = $("#loading-screen");

function dismissLoader() {
    if (!loadingScreen) return;
    loadingScreen.classList.add("is-leaving");
    window.setTimeout(() => {
        loadingScreen.hidden = true;
    }, 600);
}

if (document.readyState === "complete") {
    window.setTimeout(dismissLoader, 800);
} else {
    window.addEventListener("load", () => {
        window.setTimeout(dismissLoader, 800);
    }, { once: true });
    
    // Fall-safe: Kung mag-stuck ang load event, pilitin siyang tanggalin pagkalipas ng 1.5 segundo
    window.setTimeout(dismissLoader, 1500);
}

/* ---------- Login and welcome (with Loading Screen Transition) ---------- */

const loginForm = $("#login-form");
const usernameInput = $("#username");
const passwordInput = $("#password");
const togglePassword = $("#toggle-password");
const loginMessage = $("#login-message");
const loginScreen = $(".login-screen");
const welcomeScreen = $("#welcome-screen");
const continueButton = $("#continue-button");
const collectionScreen = $("#collection-screen");
const dynamicLoadingScreen = $("#loading-screen");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const showing = passwordInput.type === "password";
        passwordInput.type = showing ? "text" : "password";
        togglePassword.textContent = showing ? "Hide" : "Show";
        togglePassword.setAttribute("aria-label", showing ? "Hide password" : "Show password");
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const username = usernameInput?.value.trim() || "";
        const password = passwordInput?.value.trim() || "";

        if (!username || !password) {
            if (loginMessage) loginMessage.textContent = "Please complete both fields.";
            return;
        }

        if (!welcomeScreen || !loginScreen) {
            console.error("The login or welcome screen is missing in the HTML.", { loginScreen, welcomeScreen });
            if (loginMessage) loginMessage.textContent = "Something went wrong. Please check the website files.";
            return;
        }

        if (loginMessage) loginMessage.textContent = "";

        let loader = dynamicLoadingScreen;
        if (!loader) {
            loader = document.createElement("div");
            loader.id = "loading-screen";
            loader.innerHTML = `
                <div class="loader-heart">🤍</div>
                <div class="loader-text">Opening Between Aishi...</div>
            `;
            document.body.appendChild(loader);
        } else {
            loader.classList.remove("is-leaving");
            loader.hidden = false;
        }

        window.setTimeout(() => {
            loader.classList.add("is-leaving");
            window.setTimeout(() => {
                loader.hidden = true;
                changeScreen(loginScreen, welcomeScreen);
            }, 500);
        }, 1000);
    });
}

if (continueButton) {
    continueButton.addEventListener("click", () => {
        if (!welcomeScreen || !collectionScreen) {
            console.error("Welcome screen or Collection screen is missing.", { welcomeScreen, collectionScreen });
            return;
        }
        changeScreen(welcomeScreen, collectionScreen);
    });
}

/* ---------- Main collection navigation ---------- */

const unspokenScreen = $("#unspoken-screen");
const feelingsScreen = $("#feelings-screen");
const archiveScreen = $("#archive-screen");
const finalNotesScreen = $("#final-notes-screen");
const constellationScreen = $("#constellation-screen");

const backToCollection = $("#back-to-collection");
const backToCollectionFeelings = $("#back-to-collection-feelings");
const backToCollectionArchive = $("#back-to-collection-archive");
const backToCollectionFinal = $("#back-to-collection-final");
const backToCollectionConstellation = $("#back-to-collection-constellation");

const sectionScreens = {
    unspoken: unspokenScreen,
    feelings: feelingsScreen,
    archive: archiveScreen,
    "final-notes": finalNotesScreen,
    constellation: constellationScreen
};

$$(".open-section-button").forEach((button) => {
    button.addEventListener("click", () => {
        const sectionKey = button.dataset.section;
        const target = sectionScreens[sectionKey];

        if (!target) {
            return;
        }

        changeScreen(collectionScreen, target);

        if (sectionKey === "archive") {
            renderArchivePage(currentArchivePage);
        } else if (sectionKey === "final-notes") {
            loadRandomFinalNote();
        } else if (sectionKey === "constellation") {
            renderStarMap();
        }
    });
});

function returnToCollection(sectionScreen, resetSection) {
    if (resetSection) resetSection();
    changeScreen(sectionScreen, collectionScreen);
}

if (backToCollection) {
    backToCollection.addEventListener("click", () => {
        returnToCollection(unspokenScreen, () => {
            setHidden(letterViewer, true);
            setHidden(envelopeGrid, false);
        });
    });
}

if (backToCollectionFeelings) {
    backToCollectionFeelings.addEventListener("click", () => {
        returnToCollection(feelingsScreen, () => {
            setHidden(feelingLetter, true);
            setHidden(jarLibrary, true);
            setHidden(libraryLetterViewer, true);
            setHidden(jarGrid, false);
        });
    });
}

if (backToCollectionArchive) {
    backToCollectionArchive.addEventListener("click", () => {
        setHidden(photoLightbox, true);
        returnToCollection(archiveScreen);
    });
}

if (backToCollectionFinal) {
    backToCollectionFinal.addEventListener("click", () => {
        returnToCollection(finalNotesScreen);
    });
}

if (backToCollectionConstellation) {
    backToCollectionConstellation.addEventListener("click", () => {
        returnToCollection(constellationScreen);
    });
}

/* ---------- The Unspoken Pages (20 Letters) ---------- */

const envelopeGrid = $("#envelope-grid");
const letterViewer = $("#letter-viewer");
const openedLetterTitle = $("#opened-letter-title");
const openedLetterContent = $("#opened-letter-content");
const previousLetterButton = $("#previous-letter");
const nextLetterButton = $("#next-letter");
const closeLetterButton = $("#close-letter");
const letterCounter = $("#letter-counter");

let currentLetter = 0;

const letters = [
    {
        title: "1. The Words I Swallowed",
        date: "Written honestly",
        paragraphs: [
            "There were moments when I had so much to say, but somehow, I couldn't find the right words.",
            "Some thoughts stayed inside me because I was afraid of making things worse. Others remained unspoken because I didn't know how to explain what I truly felt.",
            "Maybe not everything needed to be said at the time. But I still wanted these words to have somewhere to exist."
        ]
    },
    {
        title: "2. What I Never Got to Explain",
        date: "For the lingering silence",
        paragraphs: [
            "There were things I wish I had explained better when we had the chance.",
            "Not every silence meant I had nothing to say. Not every withdrawal came from a lack of care—sometimes it was just exhaustion from trying too hard.",
            "I cannot change how the past unfolded, but I can acknowledge the weight of the things left unsaid."
        ]
    },
    {
        title: "3. When Promises Felt Like Heavy Air",
        date: "On empty words",
        paragraphs: [
            "It hurts differently when someone says all the right things to keep you close, but leaves those words hanging with nothing behind them.",
            "I used to hold onto every single assurance, believing that intent alone was enough. But holding onto blueprints of a future that kept getting postponed is exhausting.",
            "You promised consistency, you promised time, and yet most days I was left talking to a ghost of what we used to be."
        ]
    },
    {
        title: "4. Bakit Kailangan Pang Humingi ng Oras?",
        date: "A quiet bout of tampo",
        paragraphs: [
            "Hindi ko alam kung bakit kailangan ko pang magmakaawa o maghintay para lang mapansin o mapagtuunan ng pansin.",
            "Yung tipong andiyan ka nga, pero pakiramdam ko mag-isa pa rin ako sa biyahe. Ang sakit lang na parang ang dali-dali sa iyong kalimutan yung mga maliliit na bagay na dati'y pinahahalagahan mo.",
            "Sana dumating yung araw na hindi ko na kailangan magtampo para lang maramdaman kong importante ako."
        ]
    },
    {
        title: "5. The Weight of Waiting",
        date: "Stuck in anticipation",
        paragraphs: [
            "There is a unique kind of sadness in sitting around, waiting for a message or a sign that things are going to change, only to watch hours pass by in complete silence.",
            "I became an expert at making excuses for you, convincing myself that you were just busy or overwhelmed. But deep down, it just felt like I was slowly sliding down your list of priorities.",
            "Waiting stopped feeling hopeful a long time ago. Now it just feels heavy."
        ]
    },
    {
        title: "6. When I Still Had So Much to Say",
        date: "Fragments of us",
        paragraphs: [
            "I remember having so many little things I wanted to tell you throughout the day.",
            "Ordinary thoughts, random jokes, and little updates that I immediately wanted to share with you. But somewhere along the way, I learned to swallow them back down.",
            "Those words may never reach you now, but they were entirely real to me when I felt them."
        ]
    },
    {
        title: "7. The Frustration of Unmatched Effort",
        date: "When trying feels one-sided",
        paragraphs: [
            "Frustration isn't just about anger; sometimes it's the hollow feeling in your chest when you realize you're the only one trying to hold the pieces together.",
            "I poured so much energy into understanding your side, protecting your feelings, and smoothing over the cracks—while feeling completely neglected on my own bad days.",
            "It's exhausting to realize that my presence was only convenient when it suited you."
        ]
    },
    {
        title: "8. Nakakapagod Din Pala",
        date: "Quiet exhaustion",
        paragraphs: [
            "Dumating na sa puntong kahit gusto ko pang intindihin ka, wala na akong matagpuang lakas para saluhin lahat ng excuses mo.",
            "Ang sakit isipin na binigay ko naman yung buong pag-unawa ko, pero sa huli, ako pa rin yung napagod sa kakahintay sa mga pangako mong napako lang din sa ere.",
            "Sana, kahit minsan, naisip mo rin kung gaano kabigat sa pakiramdam na ikaw lang yung lumalaban para sa relasyong kayo lang ang may alam."
        ]
    },
    {
        title: "9. The Illusions We Build",
        date: "Living in potential",
        paragraphs: [
            "We spent so much time talking about 'someday' and 'next time' that we completely starved the present moment.",
            "I fell in love with your potential and the person you promised you were going to be, rather than accepting how you were treating me right in front of my eyes.",
            "That realization brings a sharp kind of grief—mourning someone who is still right here, but completely unreachable."
        ]
    },
    {
        title: "10. The Things I Couldn't Change",
        date: "Radical acceptance",
        paragraphs: [
            "Eventually, reality sets in and you realize that love alone cannot fix a lack of effort or broken accountability.",
            "Some things happened beyond what I could undo, and some apologies came way too late to fix the damage underneath.",
            "I am learning that acceptance doesn't mean it didn't hurt; it just means I'm finally letting go of the need for closure you were never going to give."
        ]
    },
    {
        title: "11. Parang Hangin Lang",
        date: "Feeling dismissed",
        paragraphs: [
            "May mga panahong gusto ko lang sabihin kung gaano ako nasasaktan sa mga pinaggagawa mo, pero natatakot ako na baka sabihin mo na naman na nag-i-isip lang ako ng kung ano-ano.",
            "Kaya tinahimik ko na lang. Mas pinili ko pang lunukin yung sama ng loob kaysa marinig ulit na parang wala lang sa iyo yung nararamdaman ko.",
            "Ang hirap makiramdam sa taong kayang-kayang balewalain yung tampo mo ng parang walang nangyari."
        ]
    },
    {
        title: "12. The Echoes of 'I Swear'",
        date: "Broken vows",
        paragraphs: [
            "You had this way of saying 'I swear, things will be different' that almost made me believe in miracles every single time.",
            "But a promise broken too many times stops sounding like an accident and starts sounding like a choice. Each time, a little piece of trust quietly slipped away.",
            "Now, those assurances just sound like noise—empty echoes bouncing off walls built out of disappointment."
        ]
    },
    {
        title: "13. The Quiet Drift",
        date: "Slow disconnection",
        paragraphs: [
            "We didn't even have a massive fight that broke us; we just drifted apart because nobody wanted to paddle anymore.",
            "The distance between us grew an inch at a time—a delayed reply here, a cold response there, until we became strangers living inside the same memories.",
            "That slow fading is much more painful than a sudden ending."
        ]
    },
    {
        title: "14. Bakit Ba Ako Nagtitiis?",
        date: "Self-reflection in sadness",
        paragraphs: [
            "Paulit-ulit ko tinatanong sa sarili ko kung bakit ko pinapayagan ang sarili ko na masaktan nang ganito kalala sa taong dapat nagbibigay sa akin ng kapayapaan.",
            "Siguro dahil natatakot akong mawala ka, kahit ang totoo, matagal na kitang unti-unting pinapakawalan dahil sa pagod.",
            "Sana dumating yung umaga na paggising ko, hindi na ikaw yung una kong hinahanap para sa saklolo ng isip ko."
        ]
    },
    {
        title: "15. What Loving You Meant",
        date: "Looking back honestly",
        paragraphs: [
            "Loving you was a massive part of my life that taught me deep lessons about resilience, patience, and heartbreak.",
            "It showed me how much I am capable of enduring for someone I care about, but it also taught me where my hard boundaries need to be drawn.",
            "Whatever the future holds, I hope we both carry forward the truths we learned without carrying the bitterness."
        ]
    },
    {
        title: "16. The Unfinished Conversations",
        date: "Midnight thoughts",
        paragraphs: [
            "There are so many arguments and explanations that live exclusively in my head at 3:00 AM.",
            "Things I wish I had said louder, boundaries I wish I had enforced firmer, and truths I wish I hadn't kept to myself just to keep the peace.",
            "Even if those words never leave this page, at least here, they finally get to breathe."
        ]
    },
    {
        title: "17. The Memory of Your Effort",
        date: "Contrast of past and present",
        paragraphs: [
            "It hurts to look back at how intensely you tried at the very beginning compared to how comfortably you settled into letting me drift away.",
            "The contrast is dizzying—going from someone who hung onto every word to someone who replies like it's a chore.",
            "I didn't ask for perfection; I only asked for the same consistency you promised when you were still trying to win me over."
        ]
    },
    {
        title: "18. Sana Naging Totoo",
        date: "Mourning unfulfilled dreams",
        paragraphs: [
            "Madalas kong isipin yung mga pinag-usapan nating plano—yung mga simpleng pangarap na binuo natin habang magkausap sa dilim.",
            "Ang sakit lang isipin na para sa iyo, kwento lang pala yun na madaling kalimutan pagkagising mo, samantalang sa akin, sinubukan kong i-ukit sa totoong buhay.",
            "Sana naging totoo ka na lang sa mga binitawan mong salita."
        ]
    },
    {
        title: "19. Releasing the Ghost",
        date: "Finding peace in letting go",
        paragraphs: [
            "I am finally realizing that holding onto resentment is like drinking poison and waiting for the other person to feel sick.",
            "I am letting go of the need for you to understand how much you hurt me, and letting go of the illusion that you'll ever apologize the way I needed.",
            "This isn't for you. This is for my own peace."
        ]
    },
    {
        title: "20. The Last Thing I Wanted You to Know",
        date: "Final closing note",
        paragraphs: [
            "I don't know what these words will mean to you, or whether you will ever stumble upon this collection.",
            "I only wanted to leave something completely honest behind—the good, the frustrated, the sad, and the unresolved—without demanding anything in return.",
            "Thank you for being part of this chapter. I genuinely hope life treats you kindly, far away from here."
        ]
    }
];

function showLetter(index) {
    if (!letters[index] || !letterViewer || !envelopeGrid) return;

    currentLetter = index;
    const letter = letters[index];

    if (openedLetterTitle) openedLetterTitle.textContent = letter.title;
    makeParagraphs(openedLetterContent, letter.paragraphs);
    if (letterCounter) letterCounter.textContent = `${index + 1} of ${letters.length}`;

    if (previousLetterButton) previousLetterButton.disabled = index === 0;
    if (nextLetterButton) nextLetterButton.disabled = index === letters.length - 1;

    setHidden(envelopeGrid, true);
    setHidden(letterViewer, false);
    animateIn($(".letter-paper", letterViewer));
    scrollToTop();
}

$$(".envelope-card").forEach((envelope) => {
    envelope.addEventListener("click", () => {
        const index = Number(envelope.dataset.letter);
        if (!Number.isInteger(index)) return;

        envelope.classList.add("envelope-opening");
        window.setTimeout(() => {
            showLetter(index);
            envelope.classList.remove("envelope-opening");
        }, 250);
    });
});

if (previousLetterButton) {
    previousLetterButton.addEventListener("click", () => {
        if (currentLetter > 0) showLetter(currentLetter - 1);
    });
}

if (nextLetterButton) {
    nextLetterButton.addEventListener("click", () => {
        if (currentLetter < letters.length - 1) showLetter(currentLetter + 1);
    });
}

if (closeLetterButton) {
    closeLetterButton.addEventListener("click", () => {
        setHidden(letterViewer, true);
        setHidden(envelopeGrid, false);
        animateIn(envelopeGrid);
        scrollToTop();
    });
}

/* ---------- Letters for Every Feeling (Base Structure) ---------- */

const jarGrid = $("#jar-grid");
const feelingLetter = $("#feeling-letter");
const feelingTitle = $("#feeling-title");
const feelingContent = $("#feeling-content");
const closeFeelingButton = $("#close-feeling");

const feelings = [
    { title: "When You Miss Me" },
    { title: "When You Are Tired" },
    { title: "Sweet & Honest" },
    { title: "Curious About You" },
    { title: "Late Night Thoughts" },
    { title: "When You Need Courage" }
];

/* ---------- 500 Feelings Database Engine ---------- */

const feelingsDatabase = (function generate500Feelings() {
    const categories = {
        "miss-you": {
            openers: [
                "Honestly, you crossed my mind out of nowhere today.",
                "Even on my busiest days, there is always a quiet moment where I wish you were right here.",
                "I saw something earlier and my first instinct was to tell you about it.",
                "Distance or busy schedules do not really change how close you feel to me.",
                "I miss the easy way conversations flow whenever we are together.",
                "It is wild how a normal afternoon feels incomplete until I hear from you.",
                "I was just replaying one of our recent laughs in my head.",
                "No dramatic speech—I simply miss having you around.",
                "Every good song that comes on reminds me of sharing headphones or a drive with you.",
                "I am counting down until the next time we get to hang out properly."
            ],
            cores: [
                "There is a calm, grounded energy you bring that nobody else really matches.",
                "You make ordinary routines feel worth looking forward to.",
                "I never feel like I have to filter myself when I am talking to you.",
                "Just knowing you are in my corner makes everything feel a little lighter.",
                "I appreciate how real and present you are whenever we spend time together.",
                "You have this effortless way of making any place feel comfortable.",
                "Even five minutes of talking to you resets my whole mood.",
                "I like the person I am when I am around you—relaxed, honest, and actually present.",
                "You stay on my mind way longer than you probably realize.",
                "Out of all the noise in a day, your voice is still my favorite part."
            ],
            closers: [
                "What are you doing right this second?",
                "Tell me one random thing that happened to you today.",
                "Save some time for me soon, okay?",
                "Let me know when you are free—I want to hear about your day.",
                "Hope you are smiling right now while reading this.",
                "Take care of yourself until I see you next.",
                "Send me a message whenever you get a breather.",
                "I am always just one call or text away.",
                "Keep this note in your pocket until we catch up.",
                "Cannot wait for our next proper conversation."
            ]
        },
        "tired": {
            openers: [
                "Take a breath—you do not have to solve everything tonight.",
                "If today drained your battery, let yourself slow down without guilt.",
                "You have been working hard, and I notice even when you do not talk about it.",
                "Put your phone down after this if you need real rest.",
                "Nobody expects you to be at 100% every single day.",
                "I wish I could hand you your favorite drink right now and tell you to relax.",
                "You carry a lot quietly, so consider this your permission to take a break.",
                "Heavy days happen, and they do not erase all the progress you are making.",
                "Rest is not laziness—it is how you stay sharp for the things that matter.",
                "Let today end where it is; tomorrow can wait its turn."
            ],
            cores: [
                "I am proud of how steady you stay even when things get overwhelming.",
                "You handle more than most people realize, and you do it with real grace.",
                "Even on your low-energy days, you are still more than enough.",
                "You do not have to put on a brave face with me—ever.",
                "If all you did today was get through it, that counts.",
                "Your well-being matters way more than checking off one more task.",
                "I respect your hustle, but I care even more about you staying healthy and rested.",
                "Sometimes the smartest move is shutting the noise out and getting good sleep.",
                "You are allowed to say no to extra stress tonight.",
                "Remember that I am here to help lighten the load whenever you let me."
            ],
            closers: [
                "Drink some water and get comfortable.",
                "What would make tonight 10% easier for you?",
                "Do you want to talk it out, or just rest quietly?",
                "Sleep well tonight—I will still be right here tomorrow.",
                "Tell me what you are craving so we can grab it soon.",
                "Close your eyes for a bit; everything else can wait.",
                "Be gentle with yourself tonight.",
                "Let me know once you are safely in bed.",
                "Tomorrow is a clean slate.",
                "Rest up—you earned it."
            ]
        },
        "sweet": {
            openers: [
                "Here is the truth: you are easily one of my favorite people to be around.",
                "I do not say it every five minutes, so let me say it clearly here—I adore you.",
                "There is something genuinely rare about the way you care about people.",
                "You have a way of making small moments feel like actual memories.",
                "Every time you laugh, it honestly makes my whole day better.",
                "I still get a little spark of excitement whenever your name pops up on my screen.",
                "You are effortlessly attractive, and your mind makes you even more magnetic.",
                "I love watching you get excited about the things you enjoy.",
                "Being close to you feels like finding the quietest, warmest corner in a loud room.",
                "You deserve all the thoughtfulness you constantly give to everyone else."
            ],
            cores: [
                "I notice the tiny details about you—the way you react, your expressions, your honesty.",
                "You make caring about someone feel simple and natural instead of complicated.",
                "I genuinely respect how you think and how grounded your heart is.",
                "With you, even doing nothing feels like time well spent.",
                "You bring a kind of warmth that sticks around long after we say goodbye.",
                "I love how you can be both deeply thoughtful and effortlessly funny.",
                "You have earned a permanent spot in my favorite thoughts.",
                "No exaggeration—meeting you changed the rhythm of my days for the better.",
                "I like everything about the pace we move at together.",
                "You make it very easy to be completely honest about how I feel."
            ],
            closers: [
                "Just wanted you to have that in writing.",
                "Never doubt where you stand with me.",
                "Keep being exactly who you are.",
                "You are stuck with me cheering you on.",
                "Read this again whenever you forget how appreciated you are.",
                "Sending a quiet smile your way.",
                "Thank you for letting me into your world.",
                "I am really glad it is you.",
                "Here is to many more moments like the ones we already have.",
                "Always rooting for you."
            ]
        },
        "curious": {
            openers: [
                "Random thought I had today—I realized I still want to learn a hundred more things about you.",
                "You always keep me curious in the best way.",
                "I love how your brain works when you start explaining something you care about.",
                "Every conversation with you opens up another side of you I want to know.",
                "I was wondering earlier what kind of day would feel like a 10/10 to you right now.",
                "There are still so many stories from your past I have not heard yet.",
                "I like trying to guess what you are thinking before you say it out loud.",
                "You have layers that make getting to know you genuinely fascinating.",
                "Sometimes I wonder what your first honest impression of me really was.",
                "I am always curious about what motivates you when nobody is watching."
            ],
            cores: [
                "Knowing the small preferences—your comfort food, your late-night habits, your weird pet peeves—matters to me.",
                "I want to know both your biggest goals and the tiny everyday things that annoy you.",
                "Hearing your perspective always makes me look at things from a sharper angle.",
                "I love asking you questions because your answers are never boring or generic.",
                "Understanding what makes you feel safe and understood is something I actually care about.",
                "Even silence with you feels full of thoughts waiting to be shared.",
                "I want to keep discovering new favorites together—music, places, late-night snacks.",
                "You never run out of interesting things to say once you get started.",
                "Learning who you are is easily my favorite ongoing project.",
                "I value real curiosity way more than surface-level small talk."
            ],
            closers: [
                "So tell me: what is something you have been thinking about lately?",
                "What is one place you really want us to visit together?",
                "What song has been stuck in your head this week?",
                "What is a small detail about yourself most people miss?",
                "If we had zero plans tonight, what would you pick to do?",
                "What is something new you have been wanting to try?",
                "Tell me a memory that always puts you in a good mood.",
                "What is your honest take on where we are right now?",
                "Hit me with a random question next time we talk.",
                "I am all ears whenever you want to share."
            ]
        },
        "late-night": {
            openers: [
                "If you are awake reading this late at night, know that my mind probably drifted to you too.",
                "Late nights always make everything feel a little clearer and more honest.",
                "When the day finally quiets down, you are usually the last good thought before sleep.",
                "There is something special about talking after midnight when all the daytime stress is gone.",
                "I love the version of our conversations that only happens late at night.",
                "Everything slows down at this hour, and appreciating you feels completely effortless.",
                "If your mind is still wide awake, let this note keep you company for a minute.",
                "Late-night drives and good music will always remind me of you.",
                "The quiet hours are when I realize how grateful I am to have you in my life.",
                "No rush, no alarms—just a quiet reminder that someone cares about you deeply."
            ],
            cores: [
                "You bring a peace that feels like a deep exhale at the end of a long night.",
                "I hope you feel genuinely safe, valued, and never alone when things get quiet.",
                "All the best parts of my recent memories somehow have you in them.",
                "You do not have to figure out the whole future tonight—just enjoy right now.",
                "Even across a screen, your presence feels warm and real.",
                "I like knowing that out of everyone in the world, we found our way onto the same wavelength.",
                "Your voice at night is honestly one of the most calming things I know.",
                "Whatever tomorrow brings, we will take it one step at a time.",
                "You deserve peaceful sleep and good mornings.",
                "Keeping space for you in my life is the easiest decision I make."
            ],
            closers: [
                "Get some rest soon, okay?",
                "Dream well tonight.",
                "Text me if you still cannot sleep.",
                "See you in the morning—or in my thoughts before then.",
                "Stay cozy and take it easy.",
                "Goodnight, Aishi.",
                "Until tomorrow.",
                "Sleep tight.",
                "Keep warm and rest your eyes.",
                "Always right here."
            ]
        }
    };

    const keys = Object.keys(categories);
    const result = {};

    keys.forEach((key, catIdx) => {
        const { openers, cores, closers } = categories[key];
        const list = [];
        for (let i = 0; i < 100; i++) {
            const opener = openers[i % openers.length];
            const core = cores[Math.floor(i / 10) % cores.length];
            const closer = closers[(i * 3 + Math.floor(i / 10)) % closers.length];
            list.push(`${opener} ${core} ${closer}`);
        }
        result[catIdx] = list;
    });

    result[5] = result[3].map((msg) => `Take a deep breath. ${msg}`);

    return result;
})();

/* ---------- Jar Protocol 2.0: no-repeat message memory ---------- */

const JAR_STORAGE_KEY = "betweenAishiJarProtocol";
let jarProtocolState = safelyReadStorage(JAR_STORAGE_KEY, {});

function getJarMemory(index) {
    if (!jarProtocolState[index] || typeof jarProtocolState[index] !== "object") {
        jarProtocolState[index] = {
            remaining: [],
            lastMessage: null,
            rareSeen: false
        };
    }
    return jarProtocolState[index];
}

function shuffleMessages(messages) {
    const shuffled = [...messages];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

function getNextJarMessage(index) {
    const feeling = feelings[index];
    const memory = getJarMemory(index);
    const pool = feelingsDatabase[index] || feelingsDatabase[0];

    if (!feeling) return { message: "", isRare: false };

    if (!memory.rareSeen && Math.random() < 0.08) {
        memory.rareSeen = true;
        safelyWriteStorage(JAR_STORAGE_KEY, jarProtocolState);
        return {
            message: "If I could leave one absolute truth with you, it would be this: even on days when you cannot see your own light, it has never stopped shining.",
            isRare: true
        };
    }

    if (!Array.isArray(memory.remaining) || memory.remaining.length === 0) {
        memory.remaining = shuffleMessages(pool);
        if (memory.remaining.length > 1 && memory.remaining[0] === memory.lastMessage) {
            [memory.remaining[0], memory.remaining[1]] = [memory.remaining[1], memory.remaining[0]];
        }
    }

    const selectedMessage = memory.remaining.shift();
    memory.lastMessage = selectedMessage;
    safelyWriteStorage(JAR_STORAGE_KEY, jarProtocolState);

    return { message: selectedMessage, isRare: false };
}

/* ---------- Jar Library storage ---------- */

const LIBRARY_STORAGE_KEY = "betweenAishiJarLibrary";
let collectedLetters = safelyReadStorage(LIBRARY_STORAGE_KEY, []);

if (!Array.isArray(collectedLetters)) collectedLetters = [];

const jarLibrary = $("#jar-library");
const libraryLetterViewer = $("#library-letter-viewer");
const libraryShelf = $("#library-shelf");
const libraryEmpty = $("#library-empty");
const libraryTotal = $("#library-total");
const libraryRare = $("#library-rare");
const openJarLibraryButton = $("#open-jar-library");
const closeJarLibraryButton = $("#close-jar-library");
const closeLibraryLetterButton = $("#close-library-letter");
const libraryLetterCategory = $("#library-letter-category");
const libraryLetterMessage = $("#library-letter-message");

let libraryReturnTo = "jars";

function saveCollectedLetter(index, result) {
    const feeling = feelings[index];
    if (!feeling) return;

    const alreadyCollected = collectedLetters.some((letter) =>
        letter.message === result.message && letter.category === feeling.title
    );

    if (alreadyCollected) return;

    collectedLetters.unshift({
        category: feeling.title,
        message: result.message,
        isRare: result.isRare,
        dateFound: new Date().toLocaleDateString()
    });

    safelyWriteStorage(LIBRARY_STORAGE_KEY, collectedLetters);
}

function renderJarLibrary() {
    if (!libraryShelf) return;

    libraryShelf.replaceChildren();
    if (libraryTotal) libraryTotal.textContent = String(collectedLetters.length);
    if (libraryRare) {
        libraryRare.textContent = String(collectedLetters.filter((letter) => letter.isRare).length);
    }
    if (libraryEmpty) libraryEmpty.hidden = collectedLetters.length > 0;

    collectedLetters.forEach((letter, index) => {
        const book = document.createElement("button");
        book.type = "button";
        book.className = "library-book";
        book.setAttribute("aria-label", `Open ${letter.isRare ? "rare " : ""}letter from ${letter.category}`);

        if (letter.isRare) book.classList.add("rare-book");

        const category = document.createElement("span");
        category.className = "library-book-category";
        category.textContent = String(letter.category || "A LITTLE NOTE").toUpperCase();

        const title = document.createElement("h3");
        title.textContent = letter.isRare ? "A Rare Letter ✧" : "A Little Letter ♡";

        const preview = document.createElement("p");
        preview.textContent = letter.message;

        const date = document.createElement("p");
        date.textContent = `Found on ${letter.dateFound || "a little while ago"}`;

        book.append(category, title, preview, date);

        if (letter.isRare) {
            const rareLabel = document.createElement("span");
            rareLabel.className = "rare-book-label";
            rareLabel.textContent = "✧ RARE DISCOVERY";
            book.appendChild(rareLabel);
        }

        book.addEventListener("click", () => openLibraryLetter(index));
        libraryShelf.appendChild(book);
    });
}

function openLibraryLetter(index) {
    const letter = collectedLetters[index];
    if (!letter || !jarLibrary || !libraryLetterViewer) return;

    libraryReturnTo = "library";
    jarLibrary.hidden = true;
    libraryLetterViewer.hidden = false;

    if (libraryLetterCategory) libraryLetterCategory.textContent = letter.category || "";
    if (libraryLetterMessage) {
        libraryLetterMessage.replaceChildren();

        if (letter.isRare) {
            const rareLabel = document.createElement("p");
            rareLabel.className = "rare-letter-label";
            rareLabel.textContent = "✧ A RARE LETTER JUST FOR YOU ✧";
            libraryLetterMessage.appendChild(rareLabel);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = letter.message;
        libraryLetterMessage.appendChild(paragraph);
    }

    animateIn($(".library-letter-paper", libraryLetterViewer));
    scrollToTop();
}

/* ---------- Glass Jar Popup Animation & Show Feeling ---------- */

function showFeeling(index) {
    const feeling = feelings[index];
    if (!feeling || !feelingLetter || !jarGrid) return;

    const result = getNextJarMessage(index);
    saveCollectedLetter(index, result);

    let popup = $("#jar-popup-modal");
    if (!popup) {
        popup = document.createElement("div");
        popup.id = "jar-popup-modal";
        popup.className = "jar-popup-overlay";
        popup.innerHTML = `
            <div class="jar-popup-card">
                <div class="jar-popup-icon">🫙✨</div>
                <h3 id="jar-popup-title"></h3>
                <div id="jar-popup-message" class="jar-popup-text"></div>
                <button type="button" id="close-jar-popup-btn" class="continue-button" style="margin: 20px auto 0;">Read Full Letter ♡</button>
            </div>
        `;
        document.body.appendChild(popup);

        document.getElementById("close-jar-popup-btn").addEventListener("click", () => {
            popup.classList.remove("is-active");
            window.setTimeout(() => {
                popup.hidden = true;
                jarGrid.hidden = true;
                feelingLetter.hidden = false;
                scrollToTop();
            }, 300);
        });
    }

    const titleEl = $("#jar-popup-title");
    const msgEl = $("#jar-popup-message");
    if (titleEl) titleEl.textContent = feeling.title;
    if (msgEl) {
        msgEl.replaceChildren();
        if (result.isRare) {
            const rareTag = document.createElement("p");
            rareTag.className = "rare-letter-label";
            rareTag.textContent = "✧ A RARE LETTER JUST FOR YOU ✧";
            msgEl.appendChild(rareTag);
        }
        const p = document.createElement("p");
        p.textContent = result.message;
        msgEl.appendChild(p);
    }

    if (feelingTitle) feelingTitle.textContent = feeling.title;
    if (feelingContent) {
        feelingContent.replaceChildren();

        if (result.isRare) {
            const rareLabel = document.createElement("p");
            rareLabel.className = "rare-letter-label";
            rareLabel.textContent = "✧ A RARE LETTER JUST FOR YOU ✧";
            feelingContent.appendChild(rareLabel);
        }

        const paragraph = document.createElement("p");
        paragraph.textContent = result.message;
        feelingContent.appendChild(paragraph);
    }

    popup.hidden = false;
    void popup.offsetWidth;
    popup.classList.add("is-active");
}

$$(".jar-card").forEach((jar) => {
    jar.addEventListener("click", () => {
        const index = Number(jar.dataset.feeling);
        if (Number.isInteger(index)) showFeeling(index);
    });
});

if (closeFeelingButton) {
    closeFeelingButton.addEventListener("click", () => {
        setHidden(feelingLetter, true);
        setHidden(jarGrid, false);
        animateIn(jarGrid);
        scrollToTop();
    });
}

if (openJarLibraryButton) {
    openJarLibraryButton.addEventListener("click", () => {
        libraryReturnTo = "jars";
        setHidden(jarGrid, true);
        setHidden(feelingLetter, true);
        setHidden(jarLibrary, false);
        setHidden(libraryLetterViewer, true);
        renderJarLibrary();
        animateIn(jarLibrary);
        scrollToTop();
    });
}

if (closeJarLibraryButton) {
    closeJarLibraryButton.addEventListener("click", () => {
        setHidden(jarLibrary, true);
        setHidden(libraryLetterViewer, true);
        setHidden(jarGrid, false);
        setHidden(feelingLetter, true);
        animateIn(jarGrid);
        scrollToTop();
    });
}

if (closeLibraryLetterButton) {
    closeLibraryLetterButton.addEventListener("click", () => {
        setHidden(libraryLetterViewer, true);

        if (libraryReturnTo === "library") {
            setHidden(jarLibrary, false);
            renderJarLibrary();
            animateIn(jarLibrary);
        } else {
            setHidden(jarLibrary, true);
            setHidden(jarGrid, false);
            animateIn(jarGrid);
        }

        scrollToTop();
    });
}

/* ---------- Constellation of Us Engine ---------- */

const starMapCanvas = $("#star-map-canvas");

const constellationStars = [
    { title: "The Spark", date: "Before we realized", text: "Even before everything clicked into place, there was already a subtle shift in the air whenever we spoke.", x: 20, y: 30 },
    { title: "Our Connection", date: "April 17, 2026", text: "The exact day everything aligned. A quiet turning point where our worlds officially connected and became 'us'.", x: 50, y: 22, isMilestone: true },
    { title: "Late Night Talks", date: "In the quiet hours", text: "When the rest of the world went to sleep, our conversations were the only place that felt fully awake and honest.", x: 78, y: 38 },
    { title: "Small Details", date: "Everyday magic", text: "The way you notice the little things, share random updates, and make ordinary days feel memorable.", x: 35, y: 70 },
    { title: "Unspoken Comfort", date: "Always", text: "No matter how busy or heavy things get, just knowing we share this space makes everything lighter.", x: 70, y: 75 }
];

function renderStarMap() {
    if (!starMapCanvas) return;
    starMapCanvas.replaceChildren();

    constellationStars.forEach((star) => {
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "star-node";
        btn.style.left = `${star.x}%`;
        btn.style.top = `${star.y}%`;

        const icon = document.createElement("span");
        icon.className = "star-icon";
        icon.textContent = star.isMilestone ? "🌟" : "✦";

        const label = document.createElement("span");
        label.className = "star-label";
        label.textContent = star.title;

        btn.append(icon, label);
        btn.addEventListener("click", () => openStarPopup(star));
        starMapCanvas.appendChild(btn);
    });
}

function openStarPopup(star) {
    let overlay = $("#star-popup-modal");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "star-popup-modal";
        overlay.className = "star-popup-overlay";
        overlay.innerHTML = `
            <div class="star-popup-card">
                <div style="font-size: 28px; margin-bottom: 10px;">✨</div>
                <span id="star-popup-date" style="font-size: 11px; letter-spacing: 2px; color: #d9bd83; font-family: 'Playfair Display', serif;"></span>
                <h3 id="star-popup-title"></h3>
                <p id="star-popup-text"></p>
                <button type="button" id="close-star-popup" class="continue-button" style="margin: 0 auto; background: #f6e7a8; color: #1a1512; border-color: #d9bd83;">Close Star ♡</button>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById("close-star-popup").addEventListener("click", () => {
            overlay.hidden = true;
        });
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) overlay.hidden = true;
        });
    }

    $("#star-popup-date").textContent = star.date.toUpperCase();
    $("#star-popup-title").textContent = star.title;
    $("#star-popup-text").textContent = star.text;
    overlay.hidden = false;
}

/* ---------- 50 Random Final Notes Engine (Section 04) ---------- */

const finalNotesDatabase = [
    {
        title: "To Aishi,",
        paragraphs: [
            "Building this little space wasn't about holding onto things that hurt, nor was it about demanding answers. It was simply about giving every genuine emotion, every unsaid word, and every quiet memory a clean place to rest.",
            "Life moves forward whether we are ready or not. But whatever happens, I hope you always remember your worth, protect your peace, and continue growing into the wonderful person you are meant to be.",
            "Thank you for every shared laugh, every lesson, and every unforgettable chapter. Take care of yourself out there."
        ]
    },
    {
        title: "A Quiet Reminder,",
        paragraphs: [
            "If you ever stumble upon this page long after today, I hope it finds you smiling and at peace with where life has taken you.",
            "We don't always get to control how stories end, but we can deeply appreciate the pages we turned together. You left a footprint on my days that time won't easily erase.",
            "Keep moving forward, trust your own rhythm, and know that you always deserve genuine happiness."
        ]
    },
    {
        title: "Before You Close This Tab,",
        paragraphs: [
            "Take a deep breath and look back at how far you've come. You carry so much strength, even on the days when you feel entirely exhausted.",
            "This space will stay right here whenever you need a quiet corner to decompress or remember that someone once cared enough to build a world around your memories.",
            "May your tomorrow be lighter and your heart be much freer."
        ]
    },
    {
        title: "To the Girl Who Loved Quiet Details,",
        paragraphs: [
            "I hope the world treats your gentleness with the respect it deserves. It's rare to find someone who pays attention to the subtle magic of ordinary days.",
            "Even if our paths diverge into completely different directions, a part of my favorite memories will always belong to the times we shared.",
            "Never lose that spark of curiosity that makes you who you are."
        ]
    },
    {
        title: "A Note on Letting Go,",
        paragraphs: [
            "Some chapters are meant to be read, appreciated, and gently closed without bitterness.",
            "I wrote these lines not to anchor you to the past, but to free both of us from the heavy weight of unspoken things.",
            "Here's to new beginnings, cleaner slates, and the quiet comfort of moving on with a smile."
        ]
    },
    ...Array.from({ length: 45 }, (_, index) => {
        const num = index + 6;
        return {
            title: `Final Note #${num},`,
            paragraphs: [
                `Reflection entry number ${num}: Every moment spent shaping this little archive reminded me of how meaningful our connection truly was.`,
                `Even when things became complicated or expectations fell short, the core of what we shared remained genuine and deeply human.`,
                `I hope this particular note finds you on a good day, feeling secure, valued, and excited for whatever comes next in your life.`
            ]
        };
    })
];

const FINAL_STORAGE_KEY = "betweenAishiFinalNotesProtocol";
let finalNotesState = safelyReadStorage(FINAL_STORAGE_KEY, { remaining: [], lastIndex: null });

function loadRandomFinalNote() {
    const headingEl = $("#final-note-heading");
    const contentEl = $("#final-note-content");
    if (!headingEl || !contentEl) return;

    if (!Array.isArray(finalNotesState.remaining) || finalNotesState.remaining.length === 0) {
        finalNotesState.remaining = finalNotesDatabase.map((_, idx) => idx);
        for (let i = finalNotesState.remaining.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [finalNotesState.remaining[i], finalNotesState.remaining[j]] = [finalNotesState.remaining[j], finalNotesState.remaining[i]];
        }
        if (finalNotesState.remaining[0] === finalNotesState.lastIndex && finalNotesState.remaining.length > 1) {
            [finalNotesState.remaining[0], finalNotesState.remaining[1]] = [finalNotesState.remaining[1], finalNotesState.remaining[0]];
        }
    }

    const nextIdx = finalNotesState.remaining.shift();
    finalNotesState.lastIndex = nextIdx;
    safelyWriteStorage(FINAL_STORAGE_KEY, finalNotesState);

    const note = finalNotesDatabase[nextIdx];
    headingEl.textContent = note.title;
    makeParagraphs(contentEl, note.paragraphs);
}

const pullAnotherNoteBtn = $("#pull-another-note-btn");
if (pullAnotherNoteBtn) {
    pullAnotherNoteBtn.addEventListener("click", () => {
        loadRandomFinalNote();
        animateIn($(".final-note-card .letter-paper"));
    });
}

/* ---------- Our Little Archive (With 3 Blank Future Pages) ---------- */

const photoGrid = $("#photo-grid");
const previousPhotoPage = $("#previous-photo-page");
const nextPhotoPage = $("#next-photo-page");
const photoPageCounter = $("#photo-page-counter");
const archivePageNumber = $("#archive-page-number");

const photoLightbox = $("#polaroid-lightbox");
const lightboxPhoto = $("#lightbox-img");
const lightboxCaption = $("#lightbox-caption");
const lightboxDate = $("#lightbox-date");
const lightboxNote = $("#lightbox-note");
const closeLightboxButton = $("#close-polaroid-btn");
const closeBackdrop = $("#polaroid-lightbox-close");
const flipPolaroidBtn = $("#flip-polaroid-btn");
const polaroidFlipCard = $("#polaroid-flip-card");

const archivePhotos = [
    { image: "Images/memories-01.jpg", caption: "A little memory", date: "A day to remember", note: "Every moment with you feels like an old favorite film." },
    { image: "Images/memories-02.jpg", caption: "One of my favorites", date: "A day to remember", note: "The little things you do without noticing mean everything." },
    { image: "Images/memories-03.jpg", caption: "Something worth keeping", date: "A day to remember", note: "If I could replay one afternoon, it would be this one." },
    { image: "Images/memories-04.jpg", caption: "A moment with you", date: "A day to remember", note: "Some places carry your laugh long after we leave." }
];

const photosPerPage = 4;
const archivePages = [];

for (let index = 0; index < archivePhotos.length; index += photosPerPage) {
    archivePages.push(archivePhotos.slice(index, index + photosPerPage));
}

const extraBlankPages = [
    {
        pageTitle: "Chapter IV — Unwritten Moments",
        subtitle: "Reserved for the next place we end up.",
        isBlankPage: true,
        photos: [
            { image: "", caption: "Future snapshot #1", date: "Coming Soon", note: "Waiting for the next chapter." },
            { image: "", caption: "Future snapshot #2", date: "Coming Soon", note: "More memories to make." }
        ]
    },
    {
        pageTitle: "Chapter V — Still Ahead of Us",
        subtitle: "Blank spaces we haven't lived yet.",
        isBlankPage: true,
        photos: [
            { image: "", caption: "Future snapshot #3", date: "Coming Soon", note: "Yet to be written." },
            { image: "", caption: "Future snapshot #4", date: "Coming Soon", note: "Looking forward to it." }
        ]
    },
    {
        pageTitle: "Chapter VI — To Be Continued",
        subtitle: "Because this archive isn't finished.",
        isBlankPage: true,
        photos: [
            { image: "", caption: "Future snapshot #5", date: "Coming Soon", note: "The story keeps going." },
            { image: "", caption: "Future snapshot #6", date: "Coming Soon", note: "Always forward." }
        ]
    }
];

archivePages.push(...extraBlankPages);

let currentArchivePage = 0;

function renderArchivePage(pageIndex) {
    if (!photoGrid || archivePages.length === 0) return;

    const safeIndex = Math.max(0, Math.min(pageIndex, archivePages.length - 1));
    currentArchivePage = safeIndex;

    const pageData = archivePages[safeIndex];
    const photos = Array.isArray(pageData) ? pageData : pageData.photos;
    
    const archivePageTitle = $("#archive-page-title");
    const archivePageSubtitle = $("#archive-page-subtitle");
    if (archivePageTitle && !Array.isArray(pageData)) archivePageTitle.textContent = pageData.pageTitle;
    if (archivePageSubtitle && !Array.isArray(pageData)) archivePageSubtitle.textContent = pageData.subtitle;

    photoGrid.replaceChildren();

    photos.forEach((photo) => {
        const photoButton = document.createElement("button");
        photoButton.type = "button";
        photoButton.className = "memory-photo";
        photoButton.setAttribute("aria-label", `View photograph: ${photo.caption}`);

        const imageContainer = document.createElement("div");
        imageContainer.className = "polaroid-image";

        if (!photo.image || photo.image === "") {
            imageContainer.textContent = "✦";
            imageContainer.style.display = "flex";
            imageContainer.style.alignItems = "center";
            imageContainer.style.justifyContent = "center";
            imageContainer.style.fontSize = "24px";
            imageContainer.style.color = "var(--antique-gold)";
        } else {
            const image = document.createElement("img");
            image.src = photo.image;
            image.alt = photo.caption;
            image.loading = "lazy";
            image.onerror = () => {
                image.remove();
                imageContainer.textContent = "📷";
            };
            imageContainer.appendChild(image);
        }

        const caption = document.createElement("p");
        caption.className = "photo-caption";
        caption.textContent = photo.caption;

        const date = document.createElement("span");
        date.className = "photo-date";
        date.textContent = photo.date;

        photoButton.append(imageContainer, caption, date);
        if (photo.image && photo.image !== "") {
            photoButton.addEventListener("click", () => openPhotoLightbox(photo));
        } else {
            photoButton.style.cursor = "default";
        }
        photoGrid.appendChild(photoButton);
    });

    if (photoPageCounter) photoPageCounter.textContent = `${safeIndex + 1} / ${archivePages.length}`;
    if (archivePageNumber) archivePageNumber.textContent = `PAGE ${String(safeIndex + 1).padStart(2, "0")}`;
    if (previousPhotoPage) previousPhotoPage.disabled = safeIndex === 0;
    if (nextPhotoPage) nextPhotoPage.disabled = safeIndex === archivePages.length - 1;

    animateIn($(".photo-book"));
}

if (previousPhotoPage) {
    previousPhotoPage.addEventListener("click", () => {
        if (currentArchivePage > 0) {
            renderArchivePage(currentArchivePage - 1);
        }
    });
}

if (nextPhotoPage) {
    nextPhotoPage.addEventListener("click", () => {
        if (currentArchivePage < archivePages.length - 1) {
            renderArchivePage(currentArchivePage + 1);
        }
    });
}

function openPhotoLightbox(photo) {
    if (!photoLightbox || !lightboxPhoto || !photo.image) return;

    lightboxPhoto.src = photo.image;
    lightboxPhoto.alt = photo.caption;
    if (lightboxCaption) lightboxCaption.textContent = photo.caption;
    if (lightboxDate) lightboxDate.textContent = photo.date;
    if (lightboxNote) lightboxNote.textContent = photo.note || "A moment worth keeping.";
    
    if (polaroidFlipCard) polaroidFlipCard.classList.remove("is-flipped");
    photoLightbox.hidden = false;
    photoLightbox.setAttribute("aria-hidden", "false");
    document.body.classList.add("lightbox-open");
    if (closeLightboxButton) closeLightboxButton.focus();
}

function closePhotoLightbox() {
    if (!photoLightbox) return;
    photoLightbox.hidden = true;
    photoLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    if (lightboxPhoto) lightboxPhoto.removeAttribute("src");
}

if (closeLightboxButton) {
    closeLightboxButton.addEventListener("click", closePhotoLightbox);
}

if (closeBackdrop) {
    closeBackdrop.addEventListener("click", closePhotoLightbox);
}

if (flipPolaroidBtn && polaroidFlipCard) {
    flipPolaroidBtn.addEventListener("click", () => {
        polaroidFlipCard.classList.toggle("is-flipped");
    });
}

if (photoLightbox) {
    photoLightbox.addEventListener("click", (event) => {
        if (event.target === photoLightbox) closePhotoLightbox();
    });
}

/* =========================================================
   CINEMA-GRADE MOTION ENGINE & AUTO-SUNSET / WAX SEAL
========================================================= */

(function initCinemaMotionAndAudio() {
    const savedTheme = localStorage.getItem("betweenAishiTheme");
    const currentHour = new Date().getHours();
    
    if (!savedTheme && (currentHour >= 18 || currentHour < 6)) {
        document.body.classList.add("auto-midnight-mode", "candlelight-mode");
        const candleIcon = $("#candlelight-icon");
        const candleLabel = $("#candlelight-label");
        if (candleIcon) candleIcon.textContent = "☀️";
        if (candleLabel) candleLabel.textContent = "Daylight";
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Cursor Spotlight */
    const halo = document.createElement("div");
    halo.className = "cursor-spotlight";
    document.body.appendChild(halo);

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let haloX = mouseX;
    let haloY = mouseY;

    window.addEventListener("mousemove", (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateHalo() {
        haloX += (mouseX - haloX) * 0.12;
        haloY += (mouseY - haloY) * 0.12;
        halo.style.left = `${haloX}px`;
        halo.style.top = `${haloY}px`;
        requestAnimationFrame(animateHalo);
    }
    animateHalo();

    /* Vinyl Music Player */
    const bgMusic = $("#bg-music");
    const vinylDisc = $("#vinyl-disc");
    const progressBarBg = $("#progress-bar-bg");
    const progressBarFill = $("#progress-bar-fill");
    const currentTimeEl = $("#current-time");
    const totalDurationEl = $("#total-duration");

    let isMusicPlaying = false;

    function formatTime(seconds) {
        if (isNaN(seconds)) return "0:00";
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    }

    function toggleVinylPlayback() {
        if (!bgMusic) return;

        if (isMusicPlaying) {
            bgMusic.pause();
            isMusicPlaying = false;
            if (vinylDisc) vinylDisc.classList.remove("is-spinning");
        } else {
            bgMusic.play().then(() => {
                isMusicPlaying = true;
                if (vinylDisc) vinylDisc.classList.add("is-spinning");
            }).catch((error) => {
                console.warn("Local audio playback prevented by browser policy:", error);
            });
        }
    }

    if (vinylDisc) {
        vinylDisc.addEventListener("click", toggleVinylPlayback);
    }

    if (bgMusic) {
        bgMusic.addEventListener("loadedmetadata", () => {
            if (totalDurationEl) totalDurationEl.textContent = formatTime(bgMusic.duration);
        });

        bgMusic.addEventListener("timeupdate", () => {
            if (!bgMusic.duration) return;
            const progressPercent = (bgMusic.currentTime / bgMusic.duration) * 100;
            if (progressBarFill) progressBarFill.style.width = `${progressPercent}%`;
            if (currentTimeEl) currentTimeEl.textContent = formatTime(bgMusic.currentTime);
        });
    }

    if (progressBarBg && bgMusic) {
        progressBarBg.addEventListener("click", (event) => {
            const rect = progressBarBg.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const width = rect.width;
            if (width > 0 && bgMusic.duration) {
                bgMusic.currentTime = (clickX / width) * bgMusic.duration;
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", () => {
            window.setTimeout(() => {
                if (bgMusic && !isMusicPlaying) {
                    bgMusic.play().then(() => {
                        isMusicPlaying = true;
                        if (vinylDisc) vinylDisc.classList.add("is-spinning");
                    }).catch(() => {});
                }
            }, 1200);
        });
    }

    /* Candlelight / Daylight Toggle */
    const candleBtn = $("#candlelight-toggle");
    const candleIcon = $("#candlelight-icon");
    const candleLabel = $("#candlelight-label");

    if (localStorage.getItem("betweenAishiTheme") === "candlelight") {
        document.body.classList.add("candlelight-mode");
        if (candleIcon) candleIcon.textContent = "☀️";
        if (candleLabel) candleLabel.textContent = "Daylight";
    }

    if (candleBtn) {
        candleBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("candlelight-mode");
            localStorage.setItem("betweenAishiTheme", isDark ? "candlelight" : "daylight");
            if (candleIcon) candleIcon.textContent = isDark ? "☀️" : "🕯️";
            if (candleLabel) candleLabel.textContent = isDark ? "Daylight" : "Candlelight";
        });
    }

    /* Milestone Ticker - Anchored to April 17, 2026 */
    const START_DATE = new Date("2026-04-17T00:00:00");

    function updateMilestoneTicker() {
        const now = new Date();
        const diff = Math.max(0, now - START_DATE);

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const mins = Math.floor((diff / 1000 / 60) % 60);
        const secs = Math.floor((diff / 1000) % 60);

        const dEl = $("#ms-days");
        const hEl = $("#ms-hours");
        const mEl = $("#ms-mins");
        const sEl = $("#ms-secs");

        if (dEl) dEl.textContent = days.toLocaleString();
        if (hEl) hEl.textContent = String(hours).padStart(2, "0");
        if (mEl) mEl.textContent = String(mins).padStart(2, "0");
        if (sEl) sEl.textContent = String(secs).padStart(2, "0");
    }

    updateMilestoneTicker();
    window.setInterval(updateMilestoneTicker, 1000);

    const randomBtn = $("#random-memory-btn");
    if (randomBtn) {
        randomBtn.addEventListener("click", () => {
            const items = $$(".envelope-card, .jar-card, .memory-photo");
            if (!items.length) return;
            const pick = items[Math.floor(Math.random() * items.length)];
            pick.scrollIntoView({ behavior: "smooth", block: "center" });
            window.setTimeout(() => pick.click(), 350);
        });
    }
})();

/* ---------- Keyboard support ---------- */

document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        const photoLightboxModal = $("#polaroid-lightbox");
        if (photoLightboxModal && !photoLightboxModal.hidden) {
            closePhotoLightbox();
        }
    }

    const photoLightboxModal = $("#polaroid-lightbox");
    if (photoLightboxModal && !photoLightboxModal.hidden) {
        if (event.key === "ArrowLeft" && currentArchivePage > 0) {
            closePhotoLightbox();
            renderArchivePage(currentArchivePage - 1);
        } else if (event.key === "ArrowRight" && currentArchivePage < archivePages.length - 1) {
            closePhotoLightbox();
            renderArchivePage(currentArchivePage + 1);
        }
    }
});