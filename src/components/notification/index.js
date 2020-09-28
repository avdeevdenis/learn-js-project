export default class NotificationMessage {
    element;

    timer;

    static isShowed = false; // показано ли в данный момент оповещение

    constructor(body, { duration = 2000, type = 'success' } = {}) {
        this.body = body;

        this.duration = duration;
        this.type = type;

        this.element = this.getHTMLFromTemplate(this.getTemplate());
    }

    setNotificationShowed() {
        NotificationMessage.isShowed = true;
    }

    setNotificationHidden() {
        NotificationMessage.isShowed = false;
    }

    setDefaultCoord({ left, top, right, bottom } = {}) {
        if (left) {
            this.element.style.left = left;
        }

        if (top) {
            this.element.style.top = top;
        }

        if (bottom) {
            this.element.style.bottom = bottom;
        }

        if (right) {
            this.element.style.right = right;
        }
    }

    show(target = document.body, options) {
        if (NotificationMessage.isShowed) {
            clearTimeout(this.timer);

            this.remove();
        }

        this.setNotificationShowed();
        this.setDefaultCoord(options);

        this.showTimeouted(target);
    }

    showTimeouted(target) {
        target?.append(this.element);

        this.timer = setTimeout(() => {
            this.remove();

            this.setNotificationHidden();
        }, this.duration);
    }

    getHTMLFromTemplate(template) {
        const parentNode = document.createElement('div');

        parentNode.innerHTML = template;

        return parentNode.firstElementChild;
    }

    getTimerValue() {
        return (this.duration / 1000) + 's';
    }

    getTemplate() {
        return `
            <div class="notification ${this.type}" style="--value:${this.getTimerValue()}">
                <div class="timer"></div>
                    <div class="inner-wrapper">
                    <div class="notification-header">${this.type}</div>
                    <div class="notification-body">
                        ${this.body}
                    </div>
                </div>
            </div>
        `;
    }

    destroy() {
        this.remove();
    }

    remove() {
        this.element.remove();
    }
}
