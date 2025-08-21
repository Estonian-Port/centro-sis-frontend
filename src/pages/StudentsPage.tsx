/* src/pages/StudentsPage.tsx */
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, {
    useState,
    useMemo,
    useDeferredValue,
    useCallback,
    Fragment,
} from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "../components/DataTable";
import { motion, AnimatePresence } from "framer-motion";
import StudentModal from "../components/NewStudentModal";
import EditStudentModal from "../components/EditStudentModal";
import MakePaymentModal from "../components/MakePaymentModal";
import type { Student } from "../types/student";
import { api } from "../lib/api";

/* ------------------------------- helpers -------------------------------- */

type FamilyFilter = "all" | "yes" | "no";

function usePeso() {
    return useMemo(
        () =>
            new Intl.NumberFormat("es-AR", {
                style: "currency",
                currency: "ARS",
                maximumFractionDigits: 0,
            }),
        []
    );
}

function HL({ text, q }: { text: string; q: string }) {
    if (!q) return <>{text}</>;
    const i = text.toLowerCase().indexOf(q.toLowerCase());
    if (i === -1) return <>{text}</>;
    const before = text.slice(0, i);
    const mid = text.slice(i, i + q.length);
    const after = text.slice(i + q.length);
    return (
        <>
            {before}
            <mark className="rounded bg-yellow-200 px-0.5">{mid}</mark>
            {after}
        </>
    );
}

/* --------------------------------- page --------------------------------- */

export default function StudentsPage() {
    const qc = useQueryClient();
    const peso = usePeso();

    /* server data */
    const {
        data: students = [],
        isLoading,
        isError,
        error,
    } = useQuery<Student[]>({
        queryKey: ["students"],
        queryFn: () => api.get("/students/").then((r) => r.data),
        staleTime: 30_000,
    });

    /* ui state */
    const [q, setQ] = useState("");
    const [family, setFamily] = useState<FamilyFilter>("all");
    const [showCreate, setShowCreate] = useState(false);

    const [selected, setSelected] = useState<Student | null>(null);
    const [editTarget, setEditTarget] = useState<Student | null>(null);
    const [payTarget, setPayTarget] = useState<Student | null>(null);

    const deferredQ = useDeferredValue(q);

    /* derived rows */
    const rows = useMemo(() => {
        const nq = deferredQ.trim().toLowerCase();
        return students.filter((s) => {
            const fullName = `${s.last_name} ${s.first_name}`;
            const txtMatch =
                s.DNI.includes(deferredQ) ||
                fullName.toLowerCase().includes(nq) ||
                s.contact?.toLowerCase().includes(nq);
            const famMatch =
                family === "all" ? true : family === "yes" ? s.has_family : !s.has_family;
            return txtMatch && famMatch;
        });
    }, [students, deferredQ, family]);

    /* actions */
    const modifyStudent = useCallback((st: Student) => setEditTarget(st), []);
    const addPayment = useCallback((st: Student) => setPayTarget(st), []);

    const handleCreated = useCallback(() => {
        setShowCreate(false);
        qc.invalidateQueries({ queryKey: ["students"] });
    }, [qc]);

    /* columns */
    const cols: ColumnDef<Student>[] = useMemo(
        () => [
            { header: "DNI", accessorKey: "DNI" },
            { header: "CUIL", accessorKey: "display_cuil" },
            {
                header: "Apellido",
                cell: ({ row }) => (
                    <HL text={row.original.last_name} q={deferredQ} />
                ),
            },
            {
                header: "Nombre",
                cell: ({ row }) => (
                    <HL text={row.original.first_name} q={deferredQ} />
                ),
            },
            {
                header: "Contacto",
                cell: ({ row }) => (
                    <HL text={row.original.contact ?? ""} q={deferredQ} />
                ),
            },
            {
                header: "Clases",
                cell: ({ row }) => row.original.enrolled_classes.join(", "),
            },
            {
                header: "Activo",
                cell: ({ row }) =>
                    row.original.active ? (
                        <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
              Sí
            </span>
                    ) : (
                        <span className="inline-flex items-center rounded-full bg-gray-50 px-2 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-300">
              No
            </span>
                    ),
            },
            {
                header: "Familia",
                cell: ({ row }) => (row.original.has_family ? "Sí" : "No"),
            },
            {
                id: "deuda",
                header: "Deuda",
                cell: ({ row }) =>
                    row.original.debt > 0 ? (
                        <span className="font-medium text-red-600">
              {peso.format(row.original.debt)}
            </span>
                    ) : (
                        "-"
                    ),
            },
            {
                id: "actions",
                header: "",
                cell: ({ row }) => (
                    <div className="flex gap-2">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                modifyStudent(row.original);
                            }}
                            className="rounded-lg bg-amber-500 px-2 py-1 text-xs text-white shadow hover:bg-amber-400"
                        >
                            Modificar
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                addPayment(row.original);
                            }}
                            className="rounded-lg bg-emerald-600 px-2 py-1 text-xs text-white shadow hover:bg-emerald-500"
                        >
                            Pagar
                        </button>
                    </div>
                ),
            },
        ],
        [modifyStudent, addPayment, deferredQ, peso]
    );

    /* render */
    return (
        <div className="mx-auto max-w-7xl p-6">
            {/* toolbar */}
            <div className="mb-5 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="relative flex-1">
                        <input
                            value={q}
                            onChange={(e) => setQ(e.target.value)}
                            placeholder="Buscar por DNI, nombre o contacto…"
                            className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 pr-9 text-sm shadow-sm outline-none ring-0 placeholder:text-gray-400 focus:border-indigo-500"
                        />
                        <svg
                            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m21 21-4.35-4.35M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z" />
                        </svg>
                    </div>

                    <select
                        value={family}
                        onChange={(e) => setFamily(e.target.value as FamilyFilter)}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-indigo-500"
                    >
                        <option value="all">Familia (todos)</option>
                        <option value="yes">Con familia</option>
                        <option value="no">Sin familia</option>
                    </select>

                    <button
                        onClick={() => setShowCreate(true)}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-indigo-500"
                    >
                        + Agregar estudiante
                    </button>
                </div>
            </div>

            {/* table / states */}
            {isLoading ? (
                <div className="space-y-2">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div
                            key={i}
                            className="h-10 animate-pulse rounded-xl bg-gray-100"
                        />
                    ))}
                </div>
            ) : isError ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    {(error as Error)?.message ?? "Error al cargar estudiantes."}
                </div>
            ) : rows.length === 0 ? (
                <div className="rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-600 shadow-sm">
                    No se encontraron estudiantes con ese filtro.
                </div>
            ) : (
                <DataTable
                    data={rows}
                    columns={cols}
                    getRowId={(row) => String(row.id)}
                    onRowClick={(row) => setSelected(row.original)}
                    rowClassName="cursor-pointer"
                    rowProps={{
                        as: motion.tr,
                        whileHover: { scale: 1.005 },
                        transition: { type: "spring", stiffness: 300, damping: 22 },
                    }}
                />
            )}

            {/* detail dialog */}
            <AnimatePresence>
                {selected && (
                    <motion.div
                        className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSelected(null)}
                    >
                        <motion.div
                            className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                            initial={{ y: 24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 24, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <h2 className="mb-4 text-lg font-semibold text-gray-900">
                                {selected.last_name} {selected.first_name} – {selected.DNI}
                            </h2>
                            <dl className="grid grid-cols-3 gap-3 text-sm">
                                <Item k="Clases" v={selected.enrolled_classes.join(", ")} />
                                <Item k="Monto mensual" v={peso.format(selected.amount_due)} />
                                <Item
                                    k="Deuda"
                                    v={
                                        selected.debt > 0 ? (
                                            <span className="text-red-600">
                        {peso.format(selected.debt)}
                      </span>
                                        ) : (
                                            "-"
                                        )
                                    }
                                />
                                <Item k="Pagado" v={selected.is_paid ? "Sí" : "No"} />
                                <Item k="Atrasado" v={selected.is_late ? "Sí" : "No"} />
                                <Item k="Familia" v={selected.has_family ? "Sí" : "No"} />
                            </dl>

                            <div className="mt-6 grid grid-cols-2 gap-2">
                                <button
                                    className="rounded-xl bg-amber-500 py-2 text-white shadow hover:bg-amber-400"
                                    onClick={() => modifyStudent(selected)}
                                >
                                    Modificar
                                </button>
                                <button
                                    className="rounded-xl bg-emerald-600 py-2 text-white shadow hover:bg-emerald-500"
                                    onClick={() => addPayment(selected)}
                                >
                                    Pagar
                                </button>
                                <button
                                    onClick={() => setSelected(null)}
                                    className="col-span-2 rounded-xl bg-gray-800 py-2 text-white shadow hover:bg-gray-700"
                                >
                                    Cerrar
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* modals */}
            <StudentModal
                open={showCreate}
                onClose={() => setShowCreate(false)}
                onCreated={handleCreated}
            />
            <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} />
            <MakePaymentModal student={payTarget} onClose={() => setPayTarget(null)} />
        </div>
    );
}

/* ------------------------------ subcomponents ---------------------------- */

function Item({
                  k,
                  v,
              }: {
    k: string;
    v: React.ReactNode;
}) {
    return (
        <Fragment>
            <dt className="col-span-1 text-gray-500">{k}</dt>
            <dd className="col-span-2 font-medium text-gray-900">{v}</dd>
        </Fragment>
    );
}
