import { SectionTitle } from "@/components/shared/SectionTitle";

const pillars = [
  {
    title: "La calidad no puede depender del día.",
    description:
      "Seleccionamos cuidadosamente cada corte para mantener un estándar constante.",
  },
  {
    title: "Cada producto se prepara como si fuera para nuestra propia cocina.",
    description:
      "Todos los productos son porcionados y empacados al vacío bajo procesos organizados.",
  },
  {
    title: "Tu cocina tiene horarios. Nosotros también.",
    description:
      "Preparamos cada pedido con organización para cumplir los tiempos acordados.",
  },
  {
    title: "Nunca serás un número más.",
    description:
      "Cada cliente recibe acompañamiento antes, durante y después de su compra.",
  },
];

export function WhyVantro() {
  return (
    <section className="border-t border-white/[0.06] bg-background py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionTitle
          eyebrow="¿Por qué VANTRO?"
          title="Más que vender proteínas, queremos ser el proveedor en el que puedas confiar todos los días."
          subtitle="Sabemos que una cocina no puede detenerse por productos de mala calidad, entregas tardías o pedidos incompletos."
        />

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col gap-2 rounded-[20px] border border-white/[0.06] bg-surface p-5"
            >
              <h3 className="text-base font-semibold text-white">{pillar.title}</h3>
              <p className="text-sm text-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
