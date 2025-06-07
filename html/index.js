const convert = document.getElementById('convert');
const progressBar = document.getElementById('progress');
const progressText = document.getElementById('progress_text');
const progress = document.getElementById('progress_div');
const selectFile = document.getElementById('select_file');
const selectOutput = document.getElementById('select_output');
const name = document.getElementById('name');
const output = document.getElementById('output');

const data = {
    filesToConvert: [],
    outputDir: ''
};

selectFile.addEventListener('click', () => {
    window.postMessage({
        type: 'select-file'
    });
});

selectOutput.addEventListener('click', () => {
    window.postMessage({
        type: 'select-output-dir'
    });
});

convert.addEventListener('click', () => {
    window.postMessage({
        type: 'convert',
        data
    });

    progressText.innerText = `0/${data.filesToConvert.length} (${Math.floor(0/data.filesToConvert.length*100)}%)`
    progressBar.value = 0/data.filesToConvert.length*100;
    progress.classList.remove('invisible');
    convert.disabled = true;
    convert.classList.add('disabled');
});

window.electronAPI.onOutputDir((value) => {
    data.outputDir = value;
    output.innerText = data.outputDir;
    output.classList.add('active');

    if (data.filesToConvert.length > 0 && !!data.outputDir) {
        convert.disabled = false;
        convert.classList.remove('disabled');
    }
});

window.electronAPI.onFileInput((value) => {
    name.innerText = value.length === 1 ? value[0].split('\\').at(-1) : `${value.length} files`;
    data.filesToConvert = value;
    name.classList.add('active');

    if (data.filesToConvert.length > 0 && !!data.outputDir) {
        convert.disabled = false;
        convert.classList.remove('disabled');
    }
});

window.electronAPI.onProgress((progress) => {
    progressText.innerText = `${progress}/${data.filesToConvert.length} (${Math.floor(progress/data.filesToConvert.length*100)}%)`
    progressBar.value = progress/data.filesToConvert.length*100;
});