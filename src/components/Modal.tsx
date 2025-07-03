import { ReactNode } from "react";

function Modal({
  visible,
  onClose,
  children,
}: {
  visible: boolean;
  onClose: VoidFunction;
  children: ReactNode;
}) {
  const handleOnClose = (
    event: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    // Pastikan event.currentTarget ada dan merupakan elemen HTML
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!visible) return null;
  return (
    <div
      onClick={handleOnClose}
      // PERBAIKAN:
      // 1. p-4: Menambahkan padding di sekeliling, mendorong modal ke bawah dari atas pada mobile.
      // 2. items-start: Memulai modal dari atas pada layar kecil.
      // 3. md:items-center: Mengembalikan ke tengah pada layar medium dan lebih besar.
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-20 backdrop-blur-sm md:items-center md:pt-4"
    >
      <div className="w-full max-w-xl rounded-xl bg-white shadow-2xl">
        {/* Konten di dalam modal sekarang bisa di-scroll jika melebihi tinggi layar */}
        <div className="max-h-[85vh] overflow-y-auto p-6">
            {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;
