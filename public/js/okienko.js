window.addEventListener("DOMContentLoaded", (event) => {

    // Pobierz elementy
    const addVisitBtn = document.getElementById("add-visit-btn");
    const editVisitBtn = document.getElementById("edit-visit-btn");
    const popupOverlay = document.getElementById('popup-overlay');
    const closePopupBtn = document.getElementById('close-popup-btn');
    const mainContent = document.getElementById('main-content');
    const saveBtn = document.getElementById("func-save-button")
    const editBtn = document.getElementById("func-edit-button")

    // Okienko & blur
    addVisitBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'flex';
        mainContent.classList.add('blur');
    });

    // Okienko & blur
    editVisitBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'flex';
        mainContent.classList.add('blur');
    });

    // Close okienko & usuń blur
    closePopupBtn.addEventListener('click', () => {
        popupOverlay.style.display = 'none';
        mainContent.classList.remove('blur');
    });

});
