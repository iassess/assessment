const updateQButtons = document.querySelectorAll('.update-question')
const deleteQButtons = document.querySelectorAll('.delete-question')
const deleteAButtons = document.querySelectorAll('.delete-assessment')
const messageDiv = document.querySelector('#message')

updateQButtons.forEach(el => el.addEventListener('click', event => {
  fetch('/questions', {
    method: 'put',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_id: event.target.parentNode.parentNode.id,
      question: document.getElementById('question-' + event.target.parentNode.parentNode.id).value
    })
  })
  .then(res => {
    if (res.ok) return res.json()
  })
  .then(response => {
    window.location.reload()
  })
}))

deleteQButtons.forEach(el => el.addEventListener('click', event => {
  fetch('/questions', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_id: event.target.parentNode.parentNode.id
    })
  })
    .then(res => {
      if (res.ok) return res.json()
    })
    .then(response => {
      window.location.reload(true)
    })
    .catch(console.error)
}))

deleteAButtons.forEach(el => el.addEventListener('click', event => {
  fetch('/assessments', {
    method: 'delete',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      doc_id: event.target.parentNode.parentNode.id
    })
  })
    .then(res => {
      if (res.ok) return res.json()
    })
    .then(response => {
      window.location.reload(true)
    })
    .catch(console.error)
}))