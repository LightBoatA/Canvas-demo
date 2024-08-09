export class HistoryManager<T> {
    private stack: T[] = [];

    private curIndex: number = -1;

    push(state: T) {
        if (this.curIndex < this.stack.length - 1) {
            this.stack = this.stack.slice(0, this.curIndex + 1);
        }
        this.stack.push(state);
        this.curIndex++;
    }

    undo(): T | null {
        if (this.curIndex > 0) {
            this.curIndex--
            return this.stack[this.curIndex]
        }
        return null;
    }

    redo(): T | null {
        if (this.curIndex < this.stack.length - 1) {
            this.curIndex++
            return this.stack[this.curIndex];
        }
        return null;
    }

    getCurrentState(): T | null {
        return this.stack[this.curIndex] || null;
    }
}