"use strict";

const textContainer = document.getElementById("text_container");
console.log(textContainer);
const textResponse = document.getElementById("text_response");
console.log(textResponse);
const form = document.querySelector("form");
const topic = document.getElementById("topic");
const age = document.getElementById("age");
const level = document.getElementById("level");
const words = document.getElementById("words");

let loadInterval;

function loader(element) {
  //Remember that the textContent will have a falsy value.
  element.textContent = "";

  // This tells the output box to add dots while the computer is thinking about the response. If it reaches a maximum of 3 dots, it will reset to 1 dot. Dots are added / removed every 300ms.
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

function typeText(element, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

function generateUniqueId() {
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16);

  return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
  return `
    <div class="wrapper ${isAi && "ai"}">
      <div class="chat">
        <div class="profile">

        </div>
        <div class="message" id=${uniqueId}>${value}</div>
      </div>
    </div>
    `;
}

const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  console.log(data.get("topic"));
  console.log(data.get("age"));
  console.log(data.get("level"));
  console.log(data.get("words"));

  // user's chat stripe
  const visiblePrompt = `User Request: Reading Comprehension about ${data.get('topic')} for 
                          ${data.get('level')} ${data.get('age')}-year-old students with a word count of ${data.get('words')}.`
  const botPrompt = `Write a ${data.get('words')}-word reading comprehension for ${data.get('age')}-year-old students at ${data.get('level')} about ${data.get('topic')} with 5 questions and 5 multiple-choice questions.`

  textResponse.innerHTML += chatStripe(false, visiblePrompt);

  form.reset();

  //bot's chatStripe
  const uniqueId = generateUniqueId();
  textContainer.innerHTML += chatStripe(true, " ", uniqueId);

  textContainer.scrollTop = textContainer.scrollHeight;

  const messageDiv = document.getElementById(uniqueId);

  loader(messageDiv);

  // fetch data from server
  const response = await fetch('http://localhost:5000', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: botPrompt,
    })
  })

  clearInterval(loadInterval);
  messageDiv.innerHTML = '';

  if(response.ok) {
    console.log(response)
    const data = await response.json();
    console.log(data)
    const parsedData = data.bot.trim();
    console.log(parsedData)


    typeText(messageDiv, parsedData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = 'Something went wrong';
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit();
  }
});
