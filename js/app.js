
/*
 * TODO: Migrate all the code to use ES6
 */

/*
 * Create a list that holds all of your cards
 */
var cards = [
    'fa-diamond',
    'fa-paper-plane-o',
    'fa-anchor',
    'fa-bolt',
    'fa-cube',
    'fa-anchor',
    'fa-leaf',
    'fa-bicycle',
    'fa-diamond',
    'fa-bomb',
    'fa-leaf',
    'fa-bomb',
    'fa-bolt',
    'fa-paper-plane-o',
    'fa-cube',
    'fa-bicycle'
];

/*
 * Constants that are going to be used in all the script
 */
var deck = $('.deck');
var movesDisplayer = $('.moves');
var stars = $('.stars');
var timer = $('.timer');
var winningModal = $('.winning-modal');
var endStars = $('.end-stars');
var endMoves = $('.end-moves');
var endMinutes = $('.end-minutes');
var endSeconds = $('.end-seconds');

// Shuffle function from http://stackoverflow.com/a/2450976
function shuffle(array) {
    var currentIndex = array.length, temporaryValue, randomIndex;

    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// Some code taken from https://stackoverflow.com/a/7910506 and modified
function parseToClock(val) {
    return val > 9 ? val : "0" + val;
}

function startTimer() {
    runningTimer = setInterval(function(){
        timer.html(parseToClock(parseInt(seconds/60,10)) + ':' + parseToClock(++seconds%60));
    }, 1000);
}

/*
 * Will rate the player based on the number of moves he's made
 */
function ratePlayer() {
    var starsChilds = stars.children('li');
    var starsClasses = 'fa-star fa-star-o';
    var rateNumber = moves === 16 ? 2 : moves === 20 ? 1 : moves === 24 ? 0 : null;
    $(starsChilds[rateNumber]).children('i').toggleClass(starsClasses);
}

/*
 * Helper function that will wait for a given amount of time before continueing through out the code
 * Based on https://stackoverflow.com/a/39914235
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/*
 * Will take you to the end game screen and put all the info about the game in it to display
 */
function endGame() {
    if (typeof runningTimer != 'undefined') {
        clearInterval(runningTimer);
    }
    endStars.html(stars.html());
    endMoves.html(moves);
    endMinutes.html(parseInt(seconds/60,10));
    endSeconds.html(seconds%60);
    winningModal.css('display', 'block');
}

/*
 * Takes care of almost all the game functionality invoked when a card is clicked
 */
async function selectCard(event) {
    var card = $(this);
    var invalidCard = card.attr('class') === 'card open show' || card.attr('class') === 'card match';
    // Will return if the card clicked is already opened or the game is already matching another pair of cards
    if (invalidCard || matching) {
        return;
    }
    // The timer will start running if this is the first move of the game
    if (firstMove) {
        firstMove = false;
        startTimer();
    }
    card.toggleClass('open show');
    // Will do the matching if there's already a card flipped
    if (cardFlipped) {
        matching = true;
        var openedCards = $('.open');
        if (cardFlipped == card.children('i').attr('class')) {
            openedCards.toggleClass('open show match');
            cardFlipped = null;
            if ($('.match').length === cards.length) {
                endGame();
            }
        } else {
            await wait(2000);
            openedCards.toggleClass('open show');
            cardFlipped = null;
        }
        moves += 1;
        movesDisplayer.html(moves);
        if (moves === 16 || moves === 20 || moves === 24){
            ratePlayer();
        }
        matching = false;
    } else {
        cardFlipped = card.children('i').attr('class');
    }
}

/*
 * Sets up a new game cleaning all the variables used in the game
 */
function newGame() {
    cardFlipped = null;
    matching = false;
    moves = 0;
    firstMove = true;
    if (typeof runningTimer != 'undefined') {
        clearInterval(runningTimer);
    }
    seconds = 0;
    timer.html('00:00');
    stars.html('<li><i class="fa fa-star"></i></li>'.repeat(3));
    deck.html('');
    movesDisplayer.html(moves);
    var cardModel = $('<li class="card"><i class="fa"></i></li>');
    var shuffledCards = shuffle(cards);
    // This will loop through the already shuffled cards and place them on the deck
    for (var i = 0; i < shuffledCards.length; i++) {
        var card = cardModel.clone();
        card.children('i').addClass(shuffledCards[i]);
        deck.append(card);
    }
    $('li.card').click(selectCard);
}

// Starts new game when the script is run for the first time
newGame();

/*
 * Set up event listeners
 */
$('.restart').click(newGame);
$('.start-new').click(function () {
    winningModal.css('display', 'none');
    endStars.html('');
    endMoves.html('');
    endMinutes.html('');
    endSeconds.html('');
    newGame();
});
// Backdoor for the end game function, this is for development porpuses and will be deleted later on
$('header h1').click(function () {
    seconds = 20;
    moves = 8;
    endGame();
});
