const HOST = 'server.com/';

// to render the tweets with callback states and scroll functions
const DEFAULT_PAGE_SIZE = 5;
const DEFAULT_SORT_ORDER = 'recent';

const States = {
    PENDING: 'pending',
    READY: 'ready',
    BACKOFF: 'backoff'
};

let componentState = States.READY;

function getRandomString({length}){
    const characterChoices = "The New Book Would be Good ";
    const characters = [];
    while (characters.length < length) {
        const randomIndex = Math.floor(Math.random() * characterChoices.length);
        characters.push(characterChoices[randomIndex]);
    }
    return characters.join('');
}

function getRandomInteger({min, max}) {
    return Math.floor((Math.random() + min));
}

function generateSuggestion(prefix) {
    const RATIO_EXACT_MATCH = 0.3;
    const RATIO_AUTOCORRECT = 0.1;

    if (Math.random() < RATIO_AUTOCORRECT) {
        return getRandomString({ length: getRandomInteger({min: 1, max: 10}) })
    }

    if (Math.random() < RATIO_EXACT_MATCH) {
        return prefix;
    }

    return prefix + getRandomString({ length: getRandomInteger({min: 1, max: 10}) })
}

function getAutocompleteHandler(data) {
    const MAX_CHARS = 10;
    const NUM_AUTOCOMPLETE_RESULTS = 10;
    const RATIO_AUXILLERY_DATA = 0.1;

    if (data.length > MAX_CHARS) {
        return [];
    }

    const results = [];
    while (results.length < NUM_AUTOCOMPLETE_RESULTS) {
        const suggestion = generateSuggestion(data)
        if (results.find(result => result.suggestion === suggestion)) {
            continue;
        }

        if (Math.random() < RATIO_AUXILLERY_DATA) {
            for (let i = 0; i < 2; i++) {
                results.push({
                    suggestion,
                    auxillery: getRandomString({ length: getRandomInteger({min: 5, max: 10}) })
                });
            }
        } else {
            results.push({ suggestion, auxillery: "" });
        }
    }
    return results;
}

const endpoints = {
    "/tweets": {
        "get": getTweetsHandler,
        "post": postTweetHandler
    }
}

// API library

function getFunction(url, data, callback) {
    const domain = url.substring(0, url.indexOf("/"));
    const endpoint = url.substring(url.indexOf("/"), url.length);
    setTimeout(() => callback(endpoints[endpoint].get(data)), 2000);
}

const api = {
    get: getFunction,
    post: postTweetHandler
};



// to get and post tweet handlers dynamically without db.
class Database {
    constructor() {
        this.tweets = [];
    }

    query({lastTweetId, pageSize}) {
        if (!lastTweetId) {
            return this.tweets.slice(0, pageSize);
        }
        for (let i = 0; i < this.tweets.length; i++) {
            const currentTweet = this.tweets[i];
            if (currentTweet.id === lastTweetId) {
                return this.tweets.slice(i + 1, i + 1 + pageSize);
            }
        }
        return [];
    }

    insert(tweet) {
        this.tweets.push({
            tweet,
            id: getRandomString({length: 50}),
            timestamp: (new Date()).getTime()
        });
    }
}

const database = new Database();

function getTweetsHandler(data) {
    const pageSize = data.pageSize;
    const sortOrder = data.sortOrder;
    const lastTweetId = data.lastTweetId;

    if (sortOrder !== 'recent') {
        throw new Error('I dont know how to handle that');
    }

    return database.query({lastTweetId, pageSize});
}

function postTweetHandler(data) {
    database.insert(data.tweet);
}

// functionality to load test data

function loadTestData() {
    const sampleData = [];
    const sampleDataSize = 20;
    for (let i = 0; i < sampleDataSize; i++) {
        const message = getRandomString({
            length: getRandomInteger({min: 10, max: 150}),
            includeSpaces: true
        });
        const firstName = getRandomString({
            length: getRandomInteger({min: 3, max: 7}),
            includeSpaces: false
        });
        const lastName = getRandomString({
            length: getRandomInteger({min: 3, max: 7}),
            includeSpaces: false
        });
        const handle = '@' + getRandomString({
            length: getRandomInteger({min: 4, max: 8}),
            includeSpaces: false
        });
        sampleData.push({
            tweet: {
                name: `${firstName} ${lastName}`,
                message, handle
            }
        });
    }
    for (const data of sampleData) {
        // Do nothing with result
        api.post(data);
    }
}

function isComponentPending() {
    return componentState === States.PENDING;
}

function setPending() {
    componentState = States.PENDING;
    document.body.appendChild(loadingElement);
}

function setBackoff() {
    componentState = States.BACKOFF;
    document.body.removeChild(loadingElement);
}

function setReady() {
    componentState = States.READY;
    document.body.removeChild(loadingElement);
}

let lastTweetId = null;

const loadingElement = document.createElement('div');
// Give it the same style
loadingElement.classList.add('tweet');
loadingElement.innerHTML = `Here I am... Loading...
  <img class="loading__image" src="./images/avatar-image.jpg" />`;

function createTweet({name, handle, message}) {
    const template = `
    <div class="tweet">
      <div class="tweet__column avatar">
        <img class="avatar__image" src="images/avatar-image.jpg" />
      </div>
      <div class="tweet__column tweet__main">
        <div class="tweet__main__header">
          <div class="tweet__main__header__item tweet__main__header__item--name">
            ${name}
          </div>
          <div class="tweet__main__header__item tweet__main__header__item--badge">
            <img class="tweet__icon tweet__main__header__item__badge" src="images/badge.png">
          </div>
          <div class="tweet__main__header__item tweet__main__header__item--handle">
            ${handle}
          </div>
          <div class="tweet__main__header__item tweet__main__header__item--duration">
            7h
          </div>
        </div>
        <div class="tweet__main__message">
          ${message}
        </div>
        <div class="tweet__footer">
          <div class="tweet__footer__stats">
            <img class="tweet__icon tweet__footer__stats__item" src="images/reply.png" />
            <div class="tweet__footer__stats__item">
              10
            </div>
          </div>
          <div class="tweet__footer__stats">
            <img class="tweet__icon tweet__footer__stats__item" src="images/like.png" />
            <div class="tweet__footer__stats__item">
              900
            </div>
          </div>
          <div class="tweet__footer__stats">
            <img class="tweet__icon tweet__footer__stats__item" src="images/retweet.png" />
            <div class="tweet__footer__stats__item">
              1.1K
            </div>
          </div>
          <div class="tweet__footer__stats">
            <img class="tweet__icon tweet__footer__stats__item" src="images/share.png" />
          </div>
        </div>
      </div>
      <div class="tweet__menu">
        <img class="tweet__icon tweet__menu__icon" src="images/down-arrow-menu.png">
      </div>
    </div>
  `;
    return template;
}

function onNewTweets(data) {

    if (data.length <= 1) {
        setBackoff();
        setTimeout(() => setReady(), 2000);
    } else {
        setReady();
        let tweetsHTML = '';
        for (const tweetResponse of data) {
            const tweet = createTweet(tweetResponse.tweet);
            tweetsHTML += tweet;
            lastTweetId = tweetResponse.id;
        }
        document.body.innerHTML += tweetsHTML;
    }
}

function hydrate() {
    const params = {
        pageSize: DEFAULT_PAGE_SIZE,
        sortOrder: DEFAULT_SORT_ORDER
    }
    api.get(HOST + 'tweets', params, onNewTweets);
        setPending();
}

loadTestData();
hydrate();
function onScroll(event) {
    if (isComponentPending()) {
        return;
    }
    const scrolledTo = window.innerHeight + window.pageYOffset;
    const scrollLimit = document.body.offsetHeight;
    const scrollThreshold = 30;

    if (scrollLimit - scrolledTo <= scrollThreshold) {
        const params = {
            pageSize: DEFAULT_PAGE_SIZE,
            sortOrder: DEFAULT_SORT_ORDER,
            lastTweetId
        }
        api.get(HOST + 'tweets', params, onNewTweets);
        setPending();
    }
}
window.addEventListener('scroll', onScroll);
