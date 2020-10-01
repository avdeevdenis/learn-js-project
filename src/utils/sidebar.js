class Sidebar {
    toggler; // HTMLElement
    sidebarList; // HTMLElement[]

    initialize() {
        this.toggler = document.querySelector('.sidebar__toggler');
        this.sidebarList = document.querySelectorAll('[data-page]');

        if (this.toggler) {
            this.toggler.addEventListener('pointerdown', this.onToggle);
        }

        document.addEventListener('route', this.onRoute);
    }

    onRoute = event => {
        const { pageName } = event.detail;

        if (!pageName || !this.sidebarList) return;

        this.sidebarList.forEach(item => {
            if (item.dataset.page.toLocaleLowerCase() === event.detail.pageName) {
                item.parentNode.classList.add('active');
            } else {
                item.parentNode.classList.remove('active');
            }
        });
    }

    onToggle = () => {
        document.body.classList.toggle('is-collapsed-sidebar');
    }

    destroy() {
        if (this.toggler) {
            this.toggler.removeEventListener('pointerdown', this.onToggle);
        }

        document.removeEventListener('route', this.onRoute);
    }
}

const sidebar = new Sidebar();

export default sidebar;
