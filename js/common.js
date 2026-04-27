/* This note was updated on 2025/12/12.
The template (latest note): https://ichihai.dev/_temp.html

ichihai.dev - (c) 2024 Ichihai1415 All right reserved.
- ichihai.dev is a personal static website by Ichihai1415.
- Contact information can be found at https://ichihai.dev/aboutme/links.html. I would recommend contacting me at X (@ProjectS31415_1).
- ichihai.dev is hosted on Cloudflare Pages. Domain was registered on Cloudflare on 2024/03/01.
- The repository is on GitHub: https://github.com/Ichihai1415/ichihai.dev
- This repository is licensed under the MIT License.
- Some content includes AI-generated content.
- Some text is machine translated. I'm not good at English so please excuse any mistakes.
- Data from other sources are under the license of that source.
- Most of codes are formatted by Prettier.
*/

const inserts = ["header", "footer", "nav.go2top", "div.common-comment"];

fetch("/parts/_all.html")
    .then((response) => response.text())
    .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, "text/html");
        inserts.forEach((ins) => {
            {
                const insertContent = doc.getElementById(ins);
                if (!insertContent)
                    console.error(
                        "共通要素が見つかりませんでした。コードを確認してください。",
                    );
                else {
                    const insertTo = document.querySelector(ins);
                    if (!insertTo)
                        console.error(
                            "共通要素の挿入先がありません。対象: " + ins,
                        );
                    else {
                        insertTo.innerHTML = insertContent.innerHTML;
                        if (ins == "header") {
                            const headerSub =
                                document.querySelector(".header-sub");
                            document
                                .querySelector(".header-menu-icon-wrap")
                                .addEventListener("click", function () {
                                    if (headerSub.style.display == "flex") {
                                        headerSub.style.display = "none";
                                        document.querySelector(
                                            ".header-menu-icon",
                                        ).src = "/parts/sansen.svg";
                                    } else {
                                        headerSub.style.display = "flex";
                                        document.querySelector(
                                            ".header-menu-icon",
                                        ).src = "/parts/sansen_sub.svg";
                                    }
                                });
                        }
                    }
                }
            }
        });
    });
