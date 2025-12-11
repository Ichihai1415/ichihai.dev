import * as crypto_AES_GCM from "/js/crypto/AES-GCM.js";

async function AES_GCM_encrypt() {
    const plainText = document.getElementById("AES-GCM_plain").value;
    //console.log("[AES_GCM_encrypt]");
    //console.log(plainText);
    const result = await crypto_AES_GCM.encryptText_ReturnKey(plainText);
    //console.log("[AES_GCM_encrypt]");
    //console.log(result);
    document.getElementById("AES-GCM_result").value = result.data;
    document.getElementById("AES-GCM_iv").value = result.iv;
    document.getElementById("AES-GCM_key").value = result.key;
}

async function AES_GCM_decrypt() {
    const result = document.getElementById("AES-GCM_result").value;
    const iv = document.getElementById("AES-GCM_iv").value;
    const key = document.getElementById("AES-GCM_key").value;
    const plainText = await crypto_AES_GCM.decryptWithBase64Key(
        iv,
        result,
        key
    );
    document.getElementById("AES-GCM_plain").value = plainText;
}

document.getElementById("AES_GCM_encrypt").onclick = AES_GCM_encrypt;
document.getElementById("AES_GCM_decrypt").onclick = AES_GCM_decrypt;
