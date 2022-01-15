const button = document.getElementById('change-question');

function getRndInteger(min, max) {
    return Math.floor(Math.random() * (max - min) ) + min;
}

const changeQuestion = () => {
    const category = document.getElementById('category').value;
    fetch('questions.json')
    .then((response) => response.json())
    .then((data) => {
        let output = '';
        questionList = data.filter((question) => question.category == category);
        newQuestion = questionList[getRndInteger(0,questionList.length)];
        output += `<h4>${newQuestion.question}</h4>`;
        document.getElementById('question-prompt').innerHTML = output;
    })
}

window.onload = changeQuestion();
button.addEventListener('click', changeQuestion);