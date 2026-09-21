for (const quiz of document.querySelectorAll('[data-answer]')) {
  const feedback = quiz.querySelector('[data-feedback]');
  const explanation = quiz.dataset.explanation ?? '';

  quiz.addEventListener('click', (event) => {
    const choice = event.target.closest('[data-choice]');
    if (!choice || !quiz.contains(choice)) return;

    for (const button of quiz.querySelectorAll('[data-choice]')) {
      button.setAttribute('aria-pressed', String(button === choice));
    }

    const correct = choice.dataset.choice === quiz.dataset.answer;
    feedback.className = correct ? 'correct' : 'incorrect';
    feedback.textContent = correct
      ? `正确。${explanation}`
      : '再沿着“影响范围”想一次：它改变的是语义、外观，还是行为？';
  });
}
