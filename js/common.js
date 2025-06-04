// ヘッダー・フッターの読み込み

fetch("/parts/header.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("header").innerHTML = data))
    .then(() => {
        const headerSub = document.querySelector(".header-sub");
        document
            .querySelector(".header-menu-icon-wrap")
            .addEventListener("click", function () {
                console.log(headerSub.style.display);
                if (headerSub.style.display == "flex") {
                    headerSub.style.display = "none";
                    document.querySelector(".header-menu-icon").src =
                        "/parts/sansen.svg";
                } else {
                    headerSub.style.display = "flex";
                    document.querySelector(".header-menu-icon").src =
                        "/parts/sansen_sub.svg";
                }
                //console.log(headerSub.style.display);
            });
    });

fetch("/parts/footer.html")
    .then((response) => response.text())
    .then((data) => (document.querySelector("footer").innerHTML = data));
