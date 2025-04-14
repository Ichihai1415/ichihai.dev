// ヘッダー・フッターの読み込み

fetch("/parts/header.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("header").innerHTML = data));

fetch("/parts/footer.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("footer").innerHTML = data));
