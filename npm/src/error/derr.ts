function derr(callback: () => void) {
    callback();
    process.exit(1);
}

export default derr;
