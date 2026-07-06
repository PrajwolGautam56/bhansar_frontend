import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AddCompanyModal } from '../components/AddCompanyModal';
import { BadgeStatus } from '../components/BadgeStatus';
import { TopBar } from '../components/TopBar';
import { Button } from '../components/ui/Button';
import { useCompanies } from '../hooks/useCompanies';
import { useUiStore } from '../store/uiStore';

export default function CompaniesPage() {
  const { data, refetch } = useCompanies();
  const { activeModal, openModal, closeModal } = useUiStore();
  return (
    <>
      <TopBar title="Companies" actions={<Button onClick={() => openModal('company')}><Plus size={16} /> Add Company</Button>} />
      <div className="p-4 md:p-6">
        <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
          <table>
            <thead><tr><th>Company</th><th>EXIM</th><th>Products</th><th>Provider</th><th>Frequency</th><th>Status</th><th>Entry port</th><th /></tr></thead>
            <tbody>
              {data?.items.map((company) => (
                <tr key={company._id}>
                  <td><p className="font-semibold">{company.name}</p><p className="text-xs text-slate-500">{company.location}, {company.district}</p></td>
                  <td>{company.eximCode || '-'}</td>
                  <td>
                    {(company.importProductDetails?.length ? company.importProductDetails : company.importProducts?.map((name) => ({ name, hsCode: '' })))?.slice(0, 2).map((product) => (
                      <div key={`${company._id}-${product.name}`} className="text-sm">
                        {product.name}
                        {product.hsCode && <span className="text-xs text-slate-500"> · HS {product.hsCode}</span>}
                      </div>
                    )) || '-'}
                  </td>
                  <td>{company.currentServiceProvider || '-'}</td>
                  <td>{company.importFrequency || '-'}</td>
                  <td><BadgeStatus value={company.status} /></td>
                  <td>{company.entryPort || '-'}</td>
                  <td><Link className="font-semibold text-brand" to={`/companies/${company._id}`}>View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {activeModal === 'company' && <AddCompanyModal onClose={closeModal} onSaved={() => void refetch()} />}
    </>
  );
}
