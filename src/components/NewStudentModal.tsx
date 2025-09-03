/* components/NewStudentModal.tsx */
import React, {
    useEffect,
    useMemo,
    useRef,
    useState,
    ChangeEvent,
    FormEvent,
} from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "../lib/api";

/* ------------------------------- types ---------------------------------- */
interface Props {
    open: boolean;
    onClose: () => void;
    onCreated?: () => void;
}

interface ClassOption {
    id: number;
    class_name: string;
    weekly_sessions: number;
}

interface EnrollmentForm {
    option: string; // holds option id as string for <select>
    start: string;  // yyyy-mm-dd
}

interface FormState {
    DNI: string;
    cuil: string;
    first_name: string;
    last_name: string;
    birth_date: string;
    contact: string;
    is_family_member: boolean;
    enrollments: EnrollmentForm[];
}

type ApiErrorBody = Record<string, string[]>;

/* ------------------------------ component ------------------------------- */
export default function NewStudentModal({ open, onClose, onCreated }: Props) {
    const [form, setForm] = useState<FormState>({
        DNI: "",
        cuil: "",
        first_name: "",
        last_name: "",
        birth_date: "",
        contact: "",
        is_family_member: false,
        enrollments: [{ option: "", start: "" }],
    });
    const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
    const firstInputRef = useRef<HTMLInputElement>(null);

    /* fetch class options only when open */
    const { data: classOptions = [], isLoading: loadingOptions } = useQuery<
        ClassOption[]
    >({
        queryKey: ["class-options"],
        enabled: open,
        queryFn: () => api.get("/api/class-options/").then((r) => r.data),
        staleTime: 60_000,
    });

    /* mutation */
    const createStudent = useMutation<void, AxiosError<ApiErrorBody>, FormState>({
        mutationFn: (payload) =>
            api.post("/api/students/", payload).then(() => undefined),
        onSuccess: () => {
            setMsg({ ok: true, text: "Alumno creado correctamente." });
            onCreated?.();
            // reset + close after a brief pause
            setTimeout(() => {
                setMsg(null);
                setForm({
                    DNI: "",
                    cuil: "",
                    first_name: "",
                    last_name: "",
                    birth_date: "",
                    contact: "",
                    is_family_member: false,
                    enrollments: [{ option: "", start: "" }],
                });
                onClose();
            }, 900);
        },
        onError: (err) => {
            const data = err.response?.data;
            const text =
                data && Object.keys(data).length
                    ? Object.entries(data)
                        .map(([k, v]) => `${k}: ${v.join(" ")}`)
                        .join("\n")
                    : "Error inesperado.";
            setMsg({ ok: false, text });
        },
    });

    /* handlers */
    const h =
        (k: keyof FormState) =>
            (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm((prev) => ({
                    ...prev,
                    [k]:
                        e.target.type === "checkbox"
                            ? (e.target as HTMLInputElement).checked
                            : e.target.value,
                }));

    const hEnr =
        (i: number, k: keyof EnrollmentForm) =>
            (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
                setForm((prev) => {
                    const next = [...prev.enrollments];
                    next[i] = { ...next[i], [k]: e.target.value };
                    return { ...prev, enrollments: next };
                });

    const addEnrollment = () =>
        setForm((prev) => ({
            ...prev,
            enrollments: [...prev.enrollments, { option: "", start: "" }],
        }));

    const removeEnrollment = (i: number) =>
        setForm((prev) => ({
            ...prev,
            enrollments: prev.enrollments.filter((_, idx) => idx !== i),
        }));

    /* basic client-side checks */
    const valid = useMemo(() => {
        if (!/^\d+$/.test(form.DNI)) return false;
        if (!/^\d{11}$/.test(form.cuil)) return false;
        if (!form.first_name || !form.last_name || !form.birth_date) return false;
        if (
            form.enrollments.length === 0 ||
            form.enrollments.some((e) => !e.option || !e.start)
        )
            return false;
        return true;
    }, [form]);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        setMsg(null);
        if (!/^\d+$/.test(form.DNI))
            return setMsg({ ok: false, text: "DNI debe ser numérico." });
        if (!/^\d{11}$/.test(form.cuil))
            return setMsg({ ok: false, text: "CUIL debe tener 11 dígitos." });
        createStudent.mutate(form);
    };

    /* mount focus + esc to close */
    useEffect(() => {
        if (open) firstInputRef.current?.focus();
        const onKey = (ev: KeyboardEvent) => {
            if (ev.key === "Escape") onClose();
        };
        if (open) window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open, onClose]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="mx-4 w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl"
                        initial={{ y: 28, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 28, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* header */}
                        <div className="mb-4 flex items-center justify-between">
                            <h2 className="text-xl font-semibold text-gray-900">
                                Nuevo alumno
                            </h2>
                            <button
                                onClick={onClose}
                                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                aria-label="Cerrar"
                                type="button"
                            >
                                <svg
                                    className="h-5 w-5"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                >
                                    <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* form */}
                        <form onSubmit={submit} className="space-y-5">
                            {/* basic */}
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <input
                                    ref={firstInputRef}
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="DNI"
                                    inputMode="numeric"
                                    value={form.DNI}
                                    onChange={h("DNI")}
                                    required
                                />
                                <input
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="CUIL (11 dígitos)"
                                    inputMode="numeric"
                                    pattern="\d{11}"
                                    value={form.cuil}
                                    onChange={h("cuil")}
                                    required
                                />
                                <input
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="Nombre"
                                    value={form.first_name}
                                    onChange={h("first_name")}
                                    required
                                />
                                <input
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="Apellido"
                                    value={form.last_name}
                                    onChange={h("last_name")}
                                    required
                                />
                                <input
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    type="date"
                                    value={form.birth_date}
                                    onChange={h("birth_date")}
                                    required
                                />
                                <input
                                    className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                    placeholder="Contacto (tel/email)"
                                    value={form.contact}
                                    onChange={h("contact")}
                                />
                            </div>

                            <label className="inline-flex select-none items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={form.is_family_member}
                                    onChange={h("is_family_member")}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                Miembro de familia
                            </label>

                            {/* enrollments */}
                            <div>
                                <div className="mb-2 flex items-center justify-between">
                                    <p className="font-medium text-gray-900">Clases</p>
                                    <button
                                        type="button"
                                        onClick={addEnrollment}
                                        className="rounded-lg bg-gray-200 px-2 py-1 text-xs font-medium text-gray-800 hover:bg-gray-300"
                                    >
                                        + Añadir clase
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {form.enrollments.map((enr, idx) => (
                                        <div
                                            key={idx}
                                            className="grid grid-cols-1 gap-3 sm:grid-cols-5"
                                        >
                                            <select
                                                className="sm:col-span-3 w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none disabled:opacity-60"
                                                value={enr.option}
                                                onChange={hEnr(idx, "option")}
                                                required
                                                disabled={loadingOptions}
                                            >
                                                <option value="">
                                                    {loadingOptions ? "Cargando opciones…" : "– clase –"}
                                                </option>
                                                {classOptions.map((o) => (
                                                    <option key={o.id} value={String(o.id)}>
                                                        {o.class_name} · {o.weekly_sessions}×sem
                                                    </option>
                                                ))}
                                            </select>

                                            <input
                                                className="sm:col-span-2 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                                                type="date"
                                                value={enr.start}
                                                onChange={hEnr(idx, "start")}
                                                required
                                            />

                                            {form.enrollments.length > 1 && (
                                                <div className="sm:col-span-5">
                                                    <button
                                                        type="button"
                                                        onClick={() => removeEnrollment(idx)}
                                                        className="rounded-lg bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-200 hover:bg-red-100"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* message */}
                            {msg && (
                                <p
                                    className={`whitespace-pre-wrap text-sm ${
                                        msg.ok ? "text-emerald-700" : "text-red-700"
                                    }`}
                                >
                                    {msg.text}
                                </p>
                            )}

                            {/* actions */}
                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="rounded-xl px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={createStudent.isPending || !valid}
                                    className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500 disabled:opacity-60"
                                >
                                    {createStudent.isPending ? "Guardando…" : "Guardar"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
