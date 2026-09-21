import React from 'react';

const Welcome = () => {
    return (
        <div className="min-h-screen bg-slate-50 px-6 py-12 dark:bg-slate-950">
            <div className="mx-auto flex min-h-[80vh] max-w-5xl items-center justify-center">
                <div className="w-full max-w-3xl text-center">
                    {/* Icon */}
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            className="h-8 w-8"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M3 8.25l8.25 5.25L19.5 8.25M4.5 19.5h15A1.5 1.5 0 0021 18V6a1.5 1.5 0 00-1.5-1.5h-15A1.5 1.5 0 003 6v12a1.5 1.5 0 001.5 1.5z"
                            />
                        </svg>
                    </div>

                    {/* Heading */}
                    <p className="mb-3 text-sm font-semibold tracking-widest text-blue-600 uppercase dark:text-blue-400">
                        Email Sender
                    </p>

                    <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl dark:text-white">
                        Send emails,
                        <br />
                        <span className="text-blue-600 dark:text-blue-400">
                            simply and reliably.
                        </span>
                    </h1>

                    <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-slate-600 sm:text-lg dark:text-slate-400">
                        Compose beautiful emails, attach files, schedule
                        messages, and manage your email conversations from one
                        place.
                    </p>

                    {/* Actions */}
                    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                        <a
                            href="/compose"
                            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none"
                        >
                            Compose email
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                className="h-4 w-4"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M5 12h14m-6-6l6 6-6 6"
                                />
                            </svg>
                        </a>

                            <a
                                href="/emails"
                                className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
                            >
                                View emails
                            </a>

                    </div>

                    {/* Features */}
                    <div className="mt-16 grid gap-4 text-left sm:grid-cols-3">
                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-3 text-blue-600 dark:text-blue-400">
                                ✦
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Rich email editor
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Write formatted emails with bold, italic,
                                lists, alignment, and more.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-3 text-blue-600 dark:text-blue-400">
                                ↗
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                File attachments
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Send emails with images, PDFs, documents, and
                                other attachments.
                            </p>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                            <div className="mb-3 text-blue-600 dark:text-blue-400">
                                ◷
                            </div>
                            <h3 className="font-semibold text-slate-900 dark:text-white">
                                Schedule emails
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                                Choose when your email should be sent with
                                scheduled delivery.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Welcome;