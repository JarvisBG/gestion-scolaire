import React from "react";
import { X, Printer } from "lucide-react";

interface Props {
  eleve: any;
  etablissement: any;
  onClose: () => void;
}

export default function CertificatScolarite({ eleve, etablissement, onClose }: Props) {
  const today = new Date().toLocaleDateString("fr-FR");

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 print:p-0 print:bg-white print:block">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl flex flex-col max-h-[90vh] print:max-h-none print:shadow-none print:w-full">
        
        {/* Barre d'outils (invisible à l'impression) */}
        <div className="p-4 border-b flex justify-between items-center bg-gray-50 print:hidden rounded-t-xl">
          <h2 className="text-lg font-bold text-gray-800">Aperçu du Certificat</h2>
          <div className="flex gap-3">
            <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors">
              <Printer size={18} className="mr-2" /> Imprimer le document
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 bg-gray-200 rounded-lg transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Zone imprimable (A4) */}
        <div className="p-12 overflow-y-auto print:overflow-visible print:p-0 bg-white w-full flex-1 relative">
          
          {/* Un cache blanc absolu pour masquer l'arrière-plan de l'application uniquement lors de l'impression */}
          <div className="hidden print:block fixed inset-0 bg-white -z-10"></div>

          {/* Conteneur aux dimensions A4 */}
          <div className="mx-auto bg-white" style={{ maxWidth: '210mm', minHeight: '297mm' }}>
            
            {/* En-tête officiel */}
            <div className="flex justify-between items-start border-b-2 border-black pb-4 mb-8">
              <div className="text-center w-1/3">
                <p className="font-bold text-[11px] uppercase">République du Cameroun</p>
                <p className="text-[10px] italic">Paix - Travail - Patrie</p>
                <p className="font-bold text-[11px] uppercase mt-2">Ministère des Enseignements Secondaires</p>
              </div>
              
              <div className="w-1/3 flex justify-center">
                {etablissement?.logo_url ? (
                  <img src={etablissement.logo_url} alt="Logo" className="h-24 object-contain" />
                ) : (
                  <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center border-2 border-dashed border-gray-300 text-gray-400 text-xs text-center">Aucun Logo</div>
                )}
              </div>

              <div className="text-center w-1/3">
                <h1 className="font-bold text-sm uppercase text-gray-900">{etablissement?.nom || "Nom de l'établissement"}</h1>
                <p className="text-xs mt-1">{etablissement?.adresse || "Adresse non renseignée"}</p>
                <p className="text-xs">Tél: {etablissement?.telephone || "---"}</p>
                <p className="text-xs">{etablissement?.email || "---"}</p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-center underline mb-10 uppercase tracking-widest mt-12">
              Certificat de Scolarité
            </h2>

            {/* Corps du texte */}
            <div className="text-base leading-loose text-justify mb-16 px-8">
              <p>
                Je soussigné(e), <strong>{etablissement?.directeur || "le Directeur / la Directrice"}</strong>, 
                chef de l'établissement <strong>{etablissement?.nom || "susnommé"}</strong>, certifie par la présente que :
              </p>
              <div className="my-8 pl-8 space-y-2">
                <p>L'élève : <span className="font-bold text-lg uppercase">{eleve.nom} {eleve.prenom}</span></p>
                <p>Matricule : <strong>{eleve.matricule || "Non attribué"}</strong></p>
                <p>
                  Né(e) le : <strong>{eleve.date_naissance ? new Date(eleve.date_naissance).toLocaleDateString("fr-FR") : "___/___/____"}</strong> 
                  &nbsp;à <strong>{eleve.lieu_naissance || "________________"}</strong>
                </p>
              </div>
              <p>
                Est régulièrement inscrit(e) dans notre établissement et suit les cours en classe de <strong>{eleve.classe?.niveau} - {eleve.classe?.nom}</strong> pour l'année scolaire <strong>2026/2027</strong>.
              </p>
              <p className="mt-8">
                En foi de quoi, le présent certificat lui est délivré pour servir et valoir ce que de droit.
              </p>
            </div>

            {/* Signature */}
            <div className="flex justify-end pr-12 mt-16">
              <div className="text-center">
                <p className="mb-4">Fait à ................................., le <strong>{today}</strong></p>
                <p className="font-bold">Le Chef d'Établissement</p>
                <p className="italic text-xs text-gray-500 mt-1">(Cachet et Signature)</p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}