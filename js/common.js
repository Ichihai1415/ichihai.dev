// ヘッダー・フッターの読み込み

fetch("/parts/header.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("header").innerHTML = data))
    .then(() => {//ローカルだとここに入れないと動かない？
        document
            .querySelector(".header-menu-icon-wrap")
            .addEventListener("click", function () {
                const headerSub = document.querySelector(".header-sub");
                if (headerSub.style.display == "none") {
                    headerSub.style.display = "flex";
                    document.querySelector(".header-menu-icon").src =
                        "/parts/sansen_sub.svg";
                } else {
                    headerSub.style.display = "none";
                    document.querySelector(".header-menu-icon").src =
                        "/parts/sansen.svg";
                }
                //console.log(headerSub.style.display);
            });
    });

fetch("/parts/footer.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("footer").innerHTML = data));
