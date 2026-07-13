// src/modules/search/search.service.ts

import searchRepository from "./search.repository";

export interface GlobalSearchResultItem {
  id: string;
  title: string;
  subtitle?: string;
  url: string;
  category: string;
}

class SearchService {
  async searchAll(keyword: string): Promise<GlobalSearchResultItem[]> {
    const trimmed = keyword?.trim();

    if (!trimmed) {
      return [];
    }

    const [customers, loans, applications, users, guarantors, branches] =
      await Promise.all([
        searchRepository.searchCustomers(trimmed),
        searchRepository.searchLoans(trimmed),
        searchRepository.searchLoanApplications(trimmed),
        searchRepository.searchUsers(trimmed),
        searchRepository.searchGuarantors(trimmed),
        searchRepository.searchBranches(trimmed),
      ]);

    const results: GlobalSearchResultItem[] = [];

    for (const c of customers) {
      results.push({
        id: c.id,
        title: `${c.firstName} ${c.lastName}`,
        subtitle: `${c.customerNumber} • ${c.phone}`,
        url: `/admin/customers/${c.id}`,
        category: "Customers",
      });
    }

    for (const l of loans) {
      results.push({
        id: l.id,
        title: `Loan ${l.loanNumber}`,
        subtitle: `${l.customer.firstName} ${l.customer.lastName} • ${l.status}`,
        url: `/admin/loans/${l.id}`,
        category: "Loans",
      });
    }

    for (const a of applications) {
      results.push({
        id: a.id,
        title: `Application ${a.applicationNumber}`,
        subtitle: `${a.customer.firstName} ${a.customer.lastName} • ${a.status}`,
        url: `/admin/loan-applications/${a.id}`,
        category: "Loan Applications",
      });
    }

    for (const u of users) {
      results.push({
        id: u.id,
        title: `${u.firstName} ${u.lastName}`,
        subtitle: `${u.employeeNumber} • ${u.role}`,
        url: `/admin/users/${u.id}`,
        category: "Users",
      });
    }

    for (const g of guarantors) {
      results.push({
        id: g.id,
        title: g.fullName,
        subtitle: `${g.relationship} • ${g.phone}`,
        url: `/admin/customers/${g.customerId}?tab=guarantors`,
        category: "Guarantors",
      });
    }

    for (const b of branches) {
      results.push({
        id: b.id,
        title: b.name,
        subtitle: b.branchCode,
        url: `/admin/branches/${b.id}`,
        category: "Branches",
      });
    }

    return results;
  }
}

export default new SearchService();