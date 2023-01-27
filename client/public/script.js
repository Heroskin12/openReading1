"use strict";

const textContainer = document.getElementById("text-container");
console.log(textContainer);
const form = document.querySelector("form");
console.log(form);
const topic = document.getElementById("topic");
const age = document.getElementById("age");
const level = document.getElementById("level");
const words = document.getElementById("words");
const language = document.getElementById("language");
const userQuery = document.getElementById('user-query')
const botResponse = document.getElementById('bot-response');

let loadInterval;

function loader(element) {
  //Remember that the textContent will have a falsy value.
  element.textContent = "";

  // This tells the output box to add dots while the computer is thinking about the response. If it reaches a maximum of 3 dots, it will reset to 1 dot. Dots are added / removed every 300ms.
  loadInterval = setInterval(() => {
    element.textContent += ".";

    if (element.textContent === "....") {
      element.textContent = ".";
    }
  }, 300);
}

// This functions tells the program to type a character one at a time from the text response. If there is no more to input, then the interval stops.
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

// Do I need a chat stripe?
function chatStripe(value) {
  botResponse.textContent = value;      
}

// Handles the form submission.
const handleSubmit = async (e) => {
  e.preventDefault();
  const data = new FormData(form);
  console.log(data);
  

  let level;
  if (data.get("level")=="beginners") {
    level = "easy for children to read using only simple words.";
  }
  else if (data.get("level" == "Intermediate")) {
    level = "a medium difficulty to read."
  }
  else {
    level = "use fluent and advanced words."
  }

  let visiblePrompt;
  let botPrompt;
  if (data.get('length')) {
    visiblePrompt = `You have requested a plan for a ${data.get('language')} lesson about ${data.get('topic')}. The lesson is roughly ${data.get('length')} and there are ${data.get('students')} students at ${data.get('level')} level. The students are roughly ${data.get('age')} years-old.`;

    botPrompt = `Write a lesson plan for a ${data.get('language')} class. The lesson plan should be about ${data.get('topic')}. The lesson plan should take roughly ${data.get('length')} to complete. The lesson plan should be designed for ${data.get('students')} who are ${data.get('age')} years-old. The lesson plan should also be designed to consider that the students are at a ${data.get('level')} level.`
  }
  else {
    visiblePrompt = `You have requested a text about ${data.get('topic')} for  ${data.get('level')} students in ${data.get("language")}. These students are roughly ${data.get('age')}-year-olds. In total, the text should have a word count of around ${data.get('words')}.`;
  
    // The prompt that is sent to the API
    botPrompt = `Write a reading comprehension based on the following information:
    Age of reader: ${data.get('age')}
    ${data.get('language')} ability of reader: ${level} 
    Topic of Text: ${data.get('topic')} 
    Language of Text: ${data.get('language')}
    Number of Words: ${data.get('words')}
    
    In addition to the text, add a vocabulary exercise in which students have to match the word with the meaning and 5 multiple-choice questions. These questions are not part of the ${data.get('words')} word count.
    
    Lastly, make the language ${level}`

  }

  // Provides user feedback confirming their query.

  userQuery.textContent = visiblePrompt;
  form.reset();

  //bot's chatStripe
  textContainer.scrollTop = textContainer.scrollHeight;

  loader(botResponse);

  // fetch data from server
  const response = await fetch('https://openreading.onrender.com', {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: botPrompt,
    })
  })

  clearInterval(loadInterval);
  botResponse.innerHTML = '';

  if(response.ok) {
    const data = await response.json();
    const parsedData = data.bot.trim();
    typeText(botResponse, parsedData);
  } else {
    const err = await response.text();

    botResponse.textContent = 'Something went wrong';
    alert(err);
  }
};

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit();
  }
});
