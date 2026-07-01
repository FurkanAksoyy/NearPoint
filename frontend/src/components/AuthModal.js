import React, { useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import { UserCircle } from '@phosphor-icons/react';
import { useAuth } from '../context/Auth';
import { useSettings } from '../context/AppSettings';

const AuthModal = ({ show, onHide }) => {
    const { t } = useSettings();
    const { login, register } = useAuth();
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [err, setErr] = useState('');
    const [busy, setBusy] = useState(false);

    const isLogin = mode === 'login';

    const submit = async (e) => {
        e.preventDefault();
        setErr('');
        setBusy(true);
        try {
            if (isLogin) await login(email.trim(), password);
            else await register(email.trim(), password, name.trim());
            setPassword('');
            onHide();
        } catch (ex) {
            setErr(t('auth.error'));
        } finally {
            setBusy(false);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered contentClassName="auth-modal">
            <Modal.Header closeButton>
                <Modal.Title className="d-flex align-items-center gap-2">
                    <UserCircle size={22} weight="fill" color="#E8552B" />
                    {isLogin ? t('auth.login_title') : t('auth.register_title')}
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={submit}>
                    {!isLogin && (
                        <Form.Group className="mb-3">
                            <Form.Label>{t('auth.name')}</Form.Label>
                            <Form.Control value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
                        </Form.Group>
                    )}
                    <Form.Group className="mb-3">
                        <Form.Label>{t('auth.email')}</Form.Label>
                        <Form.Control type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>{t('auth.password')}</Form.Label>
                        <Form.Control type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={isLogin ? undefined : 8} autoComplete={isLogin ? 'current-password' : 'new-password'} />
                    </Form.Group>

                    {err && <Alert variant="danger" className="py-2">{err}</Alert>}

                    <Button type="submit" className="btn-ember w-100 justify-content-center" disabled={busy} style={{ border: 'none' }}>
                        {isLogin ? t('auth.login') : t('auth.register')}
                    </Button>

                    <div className="text-center mt-3">
                        <button type="button" className="auth-switch" onClick={() => { setErr(''); setMode(isLogin ? 'register' : 'login'); }}>
                            {isLogin ? t('auth.no_account') : t('auth.have_account')}
                        </button>
                    </div>
                    <p className="text-center text-muted small mt-2 mb-0">{t('auth.sync_note')}</p>
                </Form>
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;
