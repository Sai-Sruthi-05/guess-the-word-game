$(document).ready(function () {
  const $startsound = $("#startsound");
  const $endsuccesssound = $("#endsuccesssound");
  const $endfailsound = $("#endfailsound");
  const $spinner = $("#spinner");

  const $wordContainer = $("#word-container");
  const $guessForm = $("#guess-form");
  const $guessInput = $("#guess-input");
  const $submitButton = $("#submitButton");
  const $chancesSpan = $("#chances");
  const $lengthSpan = $("#length");
  const $feedbackDiv = $("#feedback");
  const $historyList = $("#history-list");

  let secretWord = "";
  let maxTries = "";
  let chancesLeft = maxTries;
  let guessedWords = [];

  $("#start-button").on("click", function () {
    $(this).prop("disabled", true);
    $submitButton.prop("disabled", false);
    $spinner.removeClass("hidden"); // Show spinner
    fetchRandomWord();
  });

  function fetchRandomWord() {
    $startsound[0].play();
    fetch("https://random-word-api.vercel.app/api?words=1&length=5")
      .then((response) => response.json())
      .then((data) => {
        secretWord = data[0].toUpperCase();
        maxTries = secretWord.length + 1;
        chancesLeft = maxTries;
        $chancesSpan.text(chancesLeft);
        $lengthSpan.text(secretWord.length);
        $guessInput.attr("maxlength", secretWord.length);
        renderWordContainers();
        console.log("Secret Word: ", secretWord);
      })
      .catch((error) => {
        console.error("Error fetching word: ", error.message);
      })
      .finally(() => {
        $spinner.addClass("hidden"); // Hide spinner in all cases
      });
  }

  $guessForm.on("submit", function (event) {
    event.preventDefault();
    const guess = $guessInput.val().toUpperCase();
    if (guess.length === secretWord.length) {
      const feedback = checkWordle(guess);
      guessedWords.push(guess);
      renderHistory();
      chancesLeft--;
      $chancesSpan.text(chancesLeft);

      if (feedback.every((val) => val === "C") || chancesLeft === 0) {
        showResult(feedback);
      }
    } else {
      alert(`Please enter a ${secretWord.length}-letter word.`);
    }
    $guessInput.val("");
  });

  function checkWordle(guess) {
    const originalWord = secretWord;
    let secretLetters = {};
    let guessLetters = {};
    let feedback = guess.split("").map((letter, index) => {
      const correctLetter = originalWord[index];
      if (letter === correctLetter) {
        return "C";
      } else {
        secretLetters[correctLetter] = (secretLetters[correctLetter] || 0) + 1;
        guessLetters[letter] = (guessLetters[letter] || 0) + 1;
        return null;
      }
    });

    feedback.forEach((result, index) => {
      const letter = guess[index];
      if (
        result !== "C" &&
        secretLetters[letter] > 0 &&
        guessLetters[letter] > 0
      ) {
        feedback[index] = "E";
        secretLetters[letter]--;
      } else if (result !== "C") {
        feedback[index] = "W";
      }
    });
    return feedback;
  }

  function showResult(feedback) {
    if (feedback.every((val) => val === "C")) {
      $endsuccesssound[0].play();
      const $resultDiv = $(
        '<div class="result-message">Congratulations! You guessed the word correctly.</div>'
      );
      $resultDiv.hide().appendTo(".container").fadeIn(1000);
    } else {
      $endfailsound[0].play();
      const $resultDiv = $(
        `<div class="result-message">Sorry, you ran out of chances. The correct word was ${secretWord}.</div>`
      );
      $resultDiv.hide().appendTo(".container").fadeIn(1000);
    }

    $guessInput.prop("disabled", true);
    $submitButton.prop("disabled", true);
    $guessForm.off("submit");

    $chancesSpan.text("0");
    $feedbackDiv.empty();
  }

  function renderWordContainers() {
    $wordContainer.empty();
    for (let i = 0; i < secretWord.length; i++) {
      $wordContainer.append(`<span class="letter" id="letter-${i}">?</span>`);
    }
  }

  function renderHistory() {
    $historyList.empty();
    guessedWords.forEach((word) => {
      const feedback = checkWordle(word);
      let wordHtml = "";
      word.split("").forEach((letter, index) => {
        let letterClass = "";
        switch (feedback[index]) {
          case "C":
            letterClass = "correct";
            break;
          case "E":
            letterClass = "exists";
            break;
          case "W":
            letterClass = "wrong";
            break;
        }
        wordHtml += `<span class="letter ${letterClass}">${letter}</span>`;
      });
      const wordClass = feedback.every((val) => val === "C")
        ? "correct-word"
        : "incorrect-word";
      $historyList.append(`<li class="${wordClass}">${wordHtml}</li>`);
    });
  }

  function reloadPage() {
    location.reload();
  }

  $("#reload-button").on("click", reloadPage);
});
