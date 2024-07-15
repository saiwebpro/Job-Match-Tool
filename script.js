let keywords = [];
let languages = [];
let certifications = [];

document.getElementById('keywordInput').addEventListener('keydown', function(event) {
    if (event.key === ',') {
        event.preventDefault();
        const input = event.target.value.trim();
        if (input && !keywords.includes(input)) {
            keywords.push(input);
            addTag(input, 'tagsContainer', keywords);
            event.target.value = '';
        }
    }
});

document.getElementById('language').addEventListener('keydown', function(event) {
    if (event.key === ',') {
        event.preventDefault();
        const input = event.target.value.trim();
        if (input && !languages.includes(input)) {
            languages.push(input);
            addTag(input, 'languagesContainer', languages);
            event.target.value = '';
        }
    }
});

document.getElementById('certifications').addEventListener('keydown', function(event) {
    if (event.key === ',') {
        event.preventDefault();
        const input = event.target.value.trim();
        if (input && !certifications.includes(input)) {
            certifications.push(input);
            addTag(input, 'certificationsContainer', certifications);
            event.target.value = '';
        }
    }
});

function handleFileSelect(event) {
    const file = event.target.files[0];
    handleFile(file);
}

function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    handleFile(file);
}

function handleDragOver(event) {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
}

function handleFile(file) {
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const fileContent = e.target.result;
            if (file.type === 'application/pdf') {
                readPDF(fileContent);
            } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
                readDOCX(fileContent);
            } else {
                document.getElementById('resume').value = fileContent;
            }
        };
        reader.readAsText(file);
    }
}

function readPDF(fileContent) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';
    const typedArray = new Uint8Array(fileContent);
    pdfjsLib.getDocument(typedArray).promise.then(function(pdf) {
        let text = '';
        let pagePromises = [];
        for (let i = 1; i <= pdf.numPages; i++) {
            pagePromises.push(
                pdf.getPage(i).then(function(page) {
                    return page.getTextContent().then(function(textContent) {
                        textContent.items.forEach(function(item) {
                            text += item.str + ' ';
                        });
                    });
                })
            );
        }
        Promise.all(pagePromises).then(function() {
            document.getElementById('resume').value = text;
            document.getElementById('fileContent').innerText = text;
        });
    });
}

function readDOCX(fileContent) {
    mammoth.extractRawText({arrayBuffer: fileContent}).then(function(result) {
        const text = result.value;
        document.getElementById('resume').value = text;
        document.getElementById('fileContent').innerText = text;
    }).catch(function(err) {
        console.error(err);
    });
}

function addTag(keyword, containerId, array) {
    const tagContainer = document.getElementById(containerId);
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerHTML = `
        <span>${keyword}</span>
        <span class="close" onclick="removeTag('${keyword}', '${containerId}', ${JSON.stringify(array)})">&times;</span>
    `;
    tagContainer.appendChild(tag);
}

function removeTag(keyword, containerId, array) {
    const index = array.indexOf(keyword);
    if (index !== -1) {
        array.splice(index, 1);
        document.getElementById(containerId).innerHTML = '';
        array.forEach(tag => {
            addTag(tag, containerId, array);
        });
    }
}

function calculateMatch() {
    const resume = document.getElementById('resume').value.toLowerCase();
    const resumeWords = new Set(resume.split(/\W+/));
    const keywordSet = new Set(keywords.map(word => word.trim().toLowerCase()));

    let matchCount = 0;

    keywordSet.forEach(word => {
        if (resumeWords.has(word)) {
            matchCount++;
        }
    });

    const matchPercentage = (matchCount / keywordSet.size) * 100;
    document.getElementById('result').innerText = `Match Percentage: ${matchPercentage.toFixed(2)}%`;
}
