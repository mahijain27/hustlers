import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/ui/Icon.jsx';

function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col items-center justify-center p-4">
            <div className="text-center max-w-md">
                <div className="inline-flex items-center justify-center size-24 bg-surface rounded-full shadow-sm mb-8">
                    <Icon name="error" size={48} className="text-muted" />
                </div>
                <h1 className="text-4xl font-black text-foreground mb-4">404</h1>
                <h2 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h2>
                <p className="text-body text-muted mb-8">
                    The page you are looking for doesn't exist or has been moved.
                </p>
                <Button variant="primary" icon="home" onClick={() => navigate(ROUTES.ROOT)} className="mx-auto">
                    Return to Home
                </Button>
            </div>
        </div>
    );
}

export default NotFoundPage;
