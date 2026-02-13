let isOpen = $state(false);

export const searchStore = {
    get isOpen() {
        return isOpen;
    },
    open: () => {
        isOpen = true;
    },
    close: () => {
        isOpen = false;
    },
    toggle: () => {
        isOpen = !isOpen;
    }
};
