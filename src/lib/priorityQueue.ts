export class PriorityQueue<T> {
  private _heap: T[];
  private _comparator: (a: T, b: T) => boolean;
  constructor(comparator: (a: T, b: T) => boolean) {
    this._heap = [];
    this._comparator = comparator;
  }

  size() {
    return this._heap.length;
  }

  isEmpty() {
    return this.size() === 0;
  }

  peek() {
    return this._heap[0];
  }

  push(value: T) {
    this._heap.push(value);
    this._siftUp();
  }

  pop(): T | undefined {
    if (this.size() > 1) {
      this._swap(0, this.size() - 1);
    }
    const poppedValue = this._heap.pop();
    this._siftDown();
    return poppedValue;
  }

  _parent(index: number) {
    return Math.floor((index - 1) / 2);
  }

  _leftChild(index: number) {
    return index * 2 + 1;
  }

  _rightChild(index: number) {
    return index * 2 + 2;
  }

  _swap(i: number, j: number) {
    [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
  }

  _siftUp() {
    let nodeIndex = this.size() - 1;
    while (
      nodeIndex > 0 &&
      this._comparator(
        this._heap[nodeIndex],
        this._heap[this._parent(nodeIndex)]
      )
    ) {
      this._swap(nodeIndex, this._parent(nodeIndex));
      nodeIndex = this._parent(nodeIndex);
    }
  }

  _siftDown() {
    let nodeIndex = 0;
    while (
      (this._leftChild(nodeIndex) < this.size() &&
        this._comparator(
          this._heap[this._leftChild(nodeIndex)],
          this._heap[nodeIndex]
        )) ||
      (this._rightChild(nodeIndex) < this.size() &&
        this._comparator(
          this._heap[this._rightChild(nodeIndex)],
          this._heap[nodeIndex]
        ))
    ) {
      let smallerChildIndex = this._leftChild(nodeIndex);
      if (
        this._rightChild(nodeIndex) < this.size() &&
        this._comparator(
          this._heap[this._rightChild(nodeIndex)],
          this._heap[this._leftChild(nodeIndex)]
        )
      ) {
        smallerChildIndex = this._rightChild(nodeIndex);
      }
      this._swap(nodeIndex, smallerChildIndex);
      nodeIndex = smallerChildIndex;
    }
  }
}
