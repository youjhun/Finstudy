import { economicTermsDatabase } from './lib/economic-terms';

const searchFor = [
  { search: '인플레이션', find: 'inflation' },
  { search: '실적', find: 'performance' },
  { search: '원가', find: 'cost' },
  { search: '수출', find: 'export' },
  { search: '물가', find: 'price' },
  { search: '금리', find: 'rate' },
];

searchFor.forEach(({ search, find }) => {
  console.log(`\n=== "${search}" 관련 용어 ===`);
  
  const related = economicTermsDatabase.filter(term => 
    term.term.toLowerCase().includes(search.toLowerCase()) ||
    term.definition.includes(search)
  ).slice(0, 5);
  
  if (related.length > 0) {
    related.forEach(t => {
      console.log(`✓ ${t.term}`);
    });
  } else {
    console.log(`(해당 용어 없음)`);
  }
});
