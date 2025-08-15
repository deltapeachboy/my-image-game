document.addEventListener('DOMContentLoaded', () => {
    // --- 設定 ---
    const imageUrls = [
        'images/part1.png',
        'images/part2.png',
        'images/part3.png',
        'images/part4.png',
        'images/part5.png',
        'images/part6.png',
        'images/part7.png',
        'images/part9.png',
        'images/part10.png',
        'images/part11.png',
        'images/part12.png',
        // ここに好きなだけ画像のパスを追加してください
    ];

    // --- DOM要素の取得 ---
    const gameContainer = document.getElementById('game-container');
    const finishButton = document.getElementById('finish-button');
    const resultContainer = document.getElementById('result-container');

    // --- 変数 ---
    let currentImageIndex = 0;
    const placedImages = []; // { src, x, y, width, height } の情報を格納
    let activeImage = null; // 現在ドラッグ中の画像要素
    let isDragging = false;
    let offsetX, offsetY;

    // --- 関数 ---

    // 次の画像を表示する関数
    function showNextImage() {
        if (currentImageIndex < imageUrls.length) {
            const img = document.createElement('img');
            img.src = imageUrls[currentImageIndex];
            img.classList.add('draggable-image');

            // 画像が読み込まれてからコンテナに追加
            img.onload = () => {
                // 画像を中央に配置
                img.style.left = `${(gameContainer.clientWidth - img.width) / 2}px`;
                img.style.top = `${(gameContainer.clientHeight - img.height) / 2}px`;
                gameContainer.appendChild(img);
                activeImage = img; // この画像を操作対象に設定

                // イベントリスナーを設定
                activeImage.addEventListener('mousedown', startDrag);
            };

        } else {
            // 全ての画像を配置完了
            activeImage = null;
            alert('全ての画像を配置しました！「完成！」ボタンを押してください。');
            finishButton.disabled = false;
        }
    }

    // ドラッグ開始
    function startDrag(e) {
        e.preventDefault();
        activeImage = e.target;
        isDragging = true;

        // 画像の左上を基準にしたマウスの位置を計算
        offsetX = e.clientX - activeImage.getBoundingClientRect().left;
        offsetY = e.clientY - activeImage.getBoundingClientRect().top;

        // document全体でマウスの動きと離したイベントを監視
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
    }

    // ドラッグ中
    function drag(e) {
        if (!isDragging || !activeImage) return;
        e.preventDefault();

        // コンテナの座標を取得
        const containerRect = gameContainer.getBoundingClientRect();

        // マウスの位置から画像の新しい左上座標を計算
        let newX = e.clientX - containerRect.left - offsetX;
        let newY = e.clientY - containerRect.top - offsetY;

        // 画像がコンテナの外に出ないように制限
        newX = Math.max(0, Math.min(newX, containerRect.width - activeImage.width));
        newY = Math.max(0, Math.min(newY, containerRect.height - activeImage.height));

        activeImage.style.left = `${newX}px`;
        activeImage.style.top = `${newY}px`;
    }

    // ドラッグ終了（ドロップ）
    function endDrag() {
        if (!isDragging || !activeImage) return;
        isDragging = false;

        // イベントリスナーを削除
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);

        // 位置情報を記録
        placedImages.push({
            src: activeImage.src,
            x: activeImage.offsetLeft,
            y: activeImage.offsetTop,
            width: activeImage.width,
            height: activeImage.height
        });

        // 配置済みのスタイルを適用
        activeImage.classList.add('placed');
        activeImage.removeEventListener('mousedown', startDrag);

        // 次の画像へ
        currentImageIndex++;
        showNextImage();
    }

    // 最終的な画像を生成する関数
    async function generateFinalImage() {
        const canvas = document.createElement('canvas');
        canvas.width = gameContainer.clientWidth;
        canvas.height = gameContainer.clientHeight;
        const ctx = canvas.getContext('2d');

        // 背景を白で塗りつぶし（透過PNGの場合）
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // 配置した画像を順番にCanvasに描画
        for (const imgData of placedImages) {
            const img = new Image();
            img.src = imgData.src;
            // 画像の読み込みを待つ
            await new Promise(resolve => img.onload = resolve);
            ctx.drawImage(img, imgData.x, imgData.y, imgData.width, imgData.height);
        }

        // Canvasを画像URLに変換して表示
        resultContainer.innerHTML = ''; // 前の結果をクリア
        const finalImage = document.createElement('img');
        finalImage.src = canvas.toDataURL('image/png');
        resultContainer.appendChild(finalImage);
    }


    // --- 初期化 ---
    finishButton.addEventListener('click', generateFinalImage);
    showNextImage(); // 最初の画像を表示
});