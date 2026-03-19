const searchBox = document.getElementById("searchBox");
const cards = document.querySelectorAll(".card");

searchBox.addEventListener("keyup", function () {

    let value = searchBox.value.toLowerCase();

    cards.forEach(function (card) {

        let text = card.innerText.toLowerCase();

        if (text.includes(value)) {
            card.style.display = "block";
        } else {
            card.style.display = "none";
        }

    });

});