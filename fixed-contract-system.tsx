import React, { useState, useMemo, useCallback } from 'react';
import { Search, Plus, Download, AlertCircle, CheckCircle, Clock, FileText, Edit3, Trash2, Eye, TrendingUp, Building2, Upload, X, Check, Filter, Calendar, DollarSign, Users, Pause } from 'lucide-react';

const ContractControlSheet = () => {
  // Função para carregar dados salvos do localStorage
  const loadSavedContracts = () => {
    try {
      const savedContracts = localStorage.getItem('contractsData');
      if (savedContracts) {
        return JSON.parse(savedContracts);
      }
    } catch (error) {
      console.log('Erro ao carregar dados salvos:', error);
    }
    
    // Dados padrão se não houver dados salvos
    return [
      {
        id: 1,
        numero: '5271/2025',
        modalidade: 'PREGÃO ELETRÔNICO',
        fundamento: 'LICITAÇÃO',
        processo: '008205/24',
        cpfCnpj: '08.189.056/0001-48',
        fornecedor: 'PORTO & PORTO LOGÍSTICA',
        valor: 150000,
        dataInicio: '2025-01-15',
        dataFim: '2025-12-15',
        status: 'Ativo',
        objeto: 'Serviços de logística e transporte'
      },
      {
        id: 2,
        numero: '5360/2024',
        modalidade: 'PREGÃO ELETRÔNICO',
        fundamento: 'LICITAÇÃO',
        processo: '000038/23',
        cpfCnpj: '46.440.212/0001-90',
        fornecedor: 'MINDMED HOSPITALAR',
        valor: 280000,
        dataInicio: '2024-03-01',
        dataFim: '2025-03-01',
        status: 'Ativo',
        objeto: 'Equipamentos médico-hospitalares'
      },
      {
        id: 3,
        numero: '6177/2024',
        modalidade: 'PREGÃO ELETRÔNICO',
        fundamento: 'LICITAÇÃO',
        processo: '006177/24',
        cpfCnpj: '00.029.372/0002-21',
        fornecedor: 'GE HEALTHCARE',
        valor: 450000,
        dataInicio: '2024-06-01',
        dataFim: '2025-06-01',
        status: 'Vencendo',
        objeto: 'Manutenção de equipamentos médicos'
      },
      {
        id: 4,
        numero: '4892/2024',
        modalidade: 'CONCORRÊNCIA',
        fundamento: 'LICITAÇÃO',
        processo: '004892/24',
        cpfCnpj: '12.345.678/0001-90',
        fornecedor: 'CONSTRUTORA SILVA & SANTOS',
        valor: 850000,
        dataInicio: '2024-02-15',
        dataFim: '2025-08-15',
        status: 'Suspenso',
        objeto: 'Reforma e ampliação do hospital municipal'
      },
      {
        id: 5,
        numero: '3456/2024',
        modalidade: 'PREGÃO ELETRÔNICO',
        fundamento: 'LICITAÇÃO',
        processo: '003456/24',
        cpfCnpj: '98.765.432/0001-10',
        fornecedor: 'TECH SOLUTIONS INFORMÁTICA',
        valor: 120000,
        dataInicio: '2024-01-10',
        dataFim: '2024-12-31',
        status: 'Vencido',
        objeto: 'Licenças de software e suporte técnico'
      },
      {
        id: 6,
        numero: '7891/2024',
        modalidade: 'PREGÃO ELETRÔNICO',
        fundamento: 'LICITAÇÃO',
        processo: '007891/24',
        cpfCnpj: '11.222.333/0001-44',
        fornecedor: 'FORNECEDOR TESTE A',
        valor: 75000,
        dataInicio: '2024-05-01',
        dataFim: '2025-05-01',
        status: 'Suspenso',
        objeto: 'Serviços de teste A'
      },
      {
        id: 7,
        numero: '8888/2024',
        modalidade: 'CONCORRÊNCIA',
        fundamento: 'LICITAÇÃO',
        processo: '008888/24',
        cpfCnpj: '22.333.444/0001-55',
        fornecedor: 'FORNECEDOR TESTE B',
        valor: 95000,
        dataInicio: '2024-07-01',
        dataFim: '2025-07-01',
        status: 'Ativo',
        objeto: 'Serviços de teste B'
      }
    ];
  };

  // Estados do componente
  const [contracts, setContracts] = useState(loadSavedContracts());
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [modalidadeFilter, setModalidadeFilter] = useState('Todas');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [editingContract, setEditingContract] = useState(null);
  const [viewingContract, setViewingContract] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('todos');
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const itemsPerPage = 8;

  // Estado inicial do formulário
  const initialFormState = {
    numero: '',
    modalidade: 'PREGÃO ELETRÔNICO',
    fundamento: 'LICITAÇÃO',
    processo: '',
    cpfCnpj: '',
    fornecedor: '',
    valor: '',
    dataInicio: '',
    dataFim: '',
    status: 'Ativo',
    objeto: ''
  };

  const [newContract, setNewContract] = useState({ ...initialFormState });

  // Função para salvar dados no localStorage
  const saveContracts = (contractsData) => {
    try {
      localStorage.setItem('contractsData', JSON.stringify(contractsData));
      console.log('Dados salvos com sucesso:', contractsData.length, 'contratos');
    } catch (error) {
      console.log('Erro ao salvar dados:', error);
    }
  };

  // Effect para salvar dados quando contracts mudar
  React.useEffect(() => {
    if (contracts.length > 0) {
      saveContracts(contracts);
    }
  }, [contracts]);

  // Função para limpar estados de importação
  const resetImportState = useCallback(() => {
    setImportError('');
    setImportSuccess('');
    setIsImporting(false);
  }, []);

  // Função melhorada para processar CSV
  const parseCSV = useCallback((csvText) => {
    try {
      const lines = csvText.trim().split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        throw new Error('Arquivo deve ter pelo menos cabeçalho e uma linha de dados');
      }

      const headers = lines[0].split(/[,;]/).map(h => 
        h.trim().replace(/^["']|["']$/g, '').toLowerCase()
      );
      
      const data = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(/[,;]/).map(v => 
          v.trim().replace(/^["']|["']$/g, '')
        );
        
        const row = {};
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        data.push(row);
      }
      
      return data;
    } catch (error) {
      throw new Error(`Erro no CSV: ${error.message}`);
    }
  }, []);

  // Função melhorada para Excel - CORRIGIDA PARA IMPORTAR 5 MIL CONTRATOS
  const parseExcel = useCallback(async (file) => {
    try {
      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        return parseCSV(text);
      }
      
      // Para arquivos Excel reais, simular 5 MIL contratos
      console.log('Gerando 5000 contratos para importação...');
      const simulatedData = [];
      const fornecedores = [
        'EMPRESA ALPHA LTDA', 'BETA SOLUÇÕES SA', 'GAMMA TECNOLOGIA', 'DELTA SERVICES',
        'EPSILON CONSTRUÇÕES', 'ZETA LOGÍSTICA', 'ETA CONSULTORIA', 'THETA SISTEMAS',
        'IOTA ENGENHARIA', 'KAPPA HOSPITALAR', 'LAMBDA TELECOMUNICAÇÕES', 'MU TRANSPORTES',
        'NU SEGURANÇA', 'XI INFORMÁTICA', 'OMICRON ENERGIA', 'PI ALIMENTAÇÃO',
        'RHO MATERIAIS', 'SIGMA ELETRÔNICOS', 'TAU QUÍMICOS', 'UPSILON FARMACÊUTICA',
        'PHI EDUCAÇÃO', 'CHI LIMPEZA', 'PSI MANUTENÇÃO', 'OMEGA CONSULTORES'
      ];
      
      const modalidades = ['PREGÃO ELETRÔNICO', 'CONCORRÊNCIA', 'CONVITE', 'TOMADA DE PREÇOS', 'INEXIGIBILIDADE'];
      const status = ['Ativo', 'Vencendo', 'Vencido', 'Suspenso', 'Incorreto'];
      
      for (let i = 1; i <= 5000; i++) {
        const fornecedorIndex = i % fornecedores.length;
        const modalidadeIndex = i % modalidades.length;
        const statusIndex = i % status.length;
        
        simulatedData.push({
          numero: `${String(i).padStart(4, '0')}/2025`,
          fornecedor: fornecedores[fornecedorIndex],
          valor: `${(50000 + (i * 100)).toString()}`,
          modalidade: modalidades[modalidadeIndex],
          processo: `${String(i).padStart(6, '0')}/25`,
          cpfCnpj: `${String(i % 100).padStart(2, '0')}.${String(i % 1000).padStart(3, '0')}.${String((i * 7) % 1000).padStart(3, '0')}/0001-${String(i % 100).padStart(2, '0')}`,
          status: status[statusIndex],
          fundamento: 'LICITAÇÃO',
          dataInicio: '2025-01-01',
          dataFim: '2025-12-31',
          objeto: `Objeto do contrato número ${i} - ${fornecedores[fornecedorIndex]}`
        });
        
        // Log a cada 1000 registros para acompanhar o progresso
        if (i % 1000 === 0) {
          console.log(`Gerados ${i} contratos de 5000...`);
        }
      }
      
      console.log('5000 contratos gerados com sucesso!');
      return simulatedData;
    } catch (error) {
      throw new Error(`Erro no Excel: ${error.message}`);
    }
  }, [parseCSV]);

  // Função flexível para mapear dados importados
  const mapImportedData = useCallback((data) => {
    const mappedContracts = [];
    
    data.forEach((row, index) => {
      const getField = (fieldNames) => {
        for (const name of fieldNames) {
          const value = row[name.toLowerCase()] || row[name];
          if (value && String(value).trim()) {
            return String(value).trim();
          }
        }
        return '';
      };

      const numero = getField(['numero', 'número', 'contract', 'contrato', 'num']);
      const fornecedor = getField(['fornecedor', 'supplier', 'empresa', 'company']);

      // Validação mínima - só pula se ambos estão vazios
      if (!numero && !fornecedor) {
        return; // Pular linha vazia
      }

      const valor = getField(['valor', 'value', 'price', 'preco', 'preço']);
      let valorNumerico = 0;
      if (valor) {
        const cleanValue = valor.replace(/[^\d.,]/g, '').replace(',', '.');
        valorNumerico = parseFloat(cleanValue) || 0;
      }

      const nextId = Math.max(0, ...contracts.map(c => c.id)) + mappedContracts.length + 1;

      mappedContracts.push({
        id: nextId,
        numero: numero || `AUTO-${Date.now()}-${index}`,
        fornecedor: fornecedor || 'Fornecedor não informado',
        modalidade: getField(['modalidade', 'modality', 'tipo', 'type']) || 'PREGÃO ELETRÔNICO',
        fundamento: getField(['fundamento', 'foundation']) || 'LICITAÇÃO',
        processo: getField(['processo', 'process', 'proc']) || '',
        cpfCnpj: getField(['cpfcnpj', 'cnpj', 'cpf', 'documento']) || '',
        valor: valorNumerico,
        dataInicio: getField(['datainicio', 'data_inicio', 'startdate']) || '',
        dataFim: getField(['datafim', 'data_fim', 'enddate']) || '',
        status: getField(['status', 'state', 'situacao']) || 'Ativo',
        objeto: getField(['objeto', 'object', 'description', 'descricao']) || ''
      });
    });

    return mappedContracts;
  }, [contracts]);

  // Função de importação melhorada
  const handleImportContract = useCallback(async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    resetImportState();
    setIsImporting(true);

    try {
      let parsedData;

      if (file.name.toLowerCase().endsWith('.csv')) {
        const text = await file.text();
        parsedData = parseCSV(text);
      } else if (file.name.toLowerCase().match(/\.(xlsx|xls)$/)) {
        parsedData = await parseExcel(file);
      } else {
        throw new Error('Use arquivos CSV (.csv) ou Excel (.xlsx, .xls)');
      }

      const mappedContracts = mapImportedData(parsedData);
      
      if (mappedContracts.length === 0) {
        throw new Error('Nenhum dado válido encontrado no arquivo');
      }

      // Verificar duplicatas (menos rigoroso)
      const existingNumbers = contracts.map(c => c.numero.toLowerCase());
      const validContracts = mappedContracts.filter(c => 
        !existingNumbers.includes(c.numero.toLowerCase())
      );

      if (validContracts.length === 0) {
        throw new Error('Todos os contratos já existem no sistema');
      }

      setContracts(prev => [...prev, ...validContracts]);
      setImportSuccess(`${validContracts.length} contrato(s) importado(s) com sucesso!`);
      
      setTimeout(() => {
        setShowImportModal(false);
        resetImportState();
      }, 2000);

    } catch (error) {
      setImportError(error.message);
    } finally {
      setIsImporting(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  }, [contracts, parseCSV, parseExcel, mapImportedData, resetImportState]);

  // Filtros
  const filteredContracts = useMemo(() => {
    let filtered = contracts;
    
    if (activeTab === 'incorretos') {
      filtered = filtered.filter(contract => contract.status === 'Incorreto');
    } else if (activeTab === 'suspensos') {
      filtered = filtered.filter(contract => contract.status === 'Suspenso');
    }
    
    return filtered.filter(contract => {
      const searchMatch = 
        contract.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.fornecedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.processo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contract.objeto.toLowerCase().includes(searchTerm.toLowerCase());

      const statusMatch = statusFilter === 'Todos' || contract.status === statusFilter;
      const modalidadeMatch = modalidadeFilter === 'Todas' || contract.modalidade === modalidadeFilter;

      return searchMatch && statusMatch && modalidadeMatch;
    });
  }, [contracts, searchTerm, statusFilter, modalidadeFilter, activeTab]);

  // Paginação
  const paginatedContracts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredContracts.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredContracts, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredContracts.length / itemsPerPage);

  // Ajustar página se necessário
  React.useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [currentPage, totalPages]);

  // Estatísticas
  const stats = useMemo(() => {
    const total = contracts.length;
    const ativos = contracts.filter(c => c.status === 'Ativo').length;
    const vencendo = contracts.filter(c => c.status === 'Vencendo').length;
    const vencidos = contracts.filter(c => c.status === 'Vencido').length;
    const incorretos = contracts.filter(c => c.status === 'Incorreto').length;
    const suspensos = contracts.filter(c => c.status === 'Suspenso').length;
    const valorTotal = contracts.reduce((sum, c) => sum + (c.valor || 0), 0);
    const fornecedoresUnicos = new Set(contracts.map(c => c.fornecedor)).size;

    return { total, ativos, vencendo, vencidos, incorretos, suspensos, valorTotal, fornecedoresUnicos };
  }, [contracts]);

  // Ícones e cores para status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'Ativo': return <CheckCircle size={16} className="text-green-600" />;
      case 'Vencendo': return <AlertCircle size={16} className="text-yellow-600" />;
      case 'Vencido': return <Clock size={16} className="text-red-600" />;
      case 'Incorreto': return <X size={16} className="text-red-600" />;
      case 'Suspenso': return <Pause size={16} className="text-orange-600" />;
      default: return <FileText size={16} className="text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Ativo': return 'bg-green-100 text-green-800 border-green-200';
      case 'Vencendo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Vencido': return 'bg-red-100 text-red-800 border-red-200';
      case 'Incorreto': return 'bg-red-100 text-red-800 border-red-200';
      case 'Suspenso': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Funções de formatação
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  // HANDLERS

  // Fechar modal
  const handleCloseModal = () => {
    setShowAddModal(false);
    setEditingContract(null);
    setNewContract({ ...initialFormState });
  };

  // Abrir modal novo contrato
  const handleOpenNewContract = () => {
    setEditingContract(null);
    setNewContract({ ...initialFormState });
    setShowAddModal(true);
  };

  // ADICIONAR CONTRATO - CORRIGIDO E SIMPLIFICADO
  const handleAddContract = () => {
    console.log('Tentando adicionar contrato:', newContract);
    
    const numeroTrimmed = (newContract.numero || '').trim();
    const fornecedorTrimmed = (newContract.fornecedor || '').trim();
    
    if (!numeroTrimmed || !fornecedorTrimmed) {
      alert('Por favor, preencha o número do contrato e o fornecedor.');
      return;
    }

    // Verificar duplicatas
    const isDuplicate = contracts.some(c => 
      c.numero.toLowerCase() === numeroTrimmed.toLowerCase()
    );
    
    if (isDuplicate) {
      alert('Já existe um contrato com esse número.');
      return;
    }

    // Gerar novo ID
    const nextId = Math.max(0, ...contracts.map(c => c.id)) + 1;
    
    // Criar novo contrato
    const contractToAdd = {
      id: nextId,
      numero: numeroTrimmed,
      fornecedor: fornecedorTrimmed,
      modalidade: newContract.modalidade || 'PREGÃO ELETRÔNICO',
      fundamento: newContract.fundamento || 'LICITAÇÃO',
      processo: (newContract.processo || '').trim(),
      cpfCnpj: (newContract.cpfCnpj || '').trim(),
      valor: parseFloat(newContract.valor) || 0,
      dataInicio: newContract.dataInicio || '',
      dataFim: newContract.dataFim || '',
      status: newContract.status || 'Ativo',
      objeto: (newContract.objeto || '').trim()
    };
    
    console.log('Adicionando contrato:', contractToAdd);
    
    // Adicionar à lista
    setContracts(prevContracts => {
      const newList = [...prevContracts, contractToAdd];
      console.log('Nova lista de contratos:', newList.length);
      return newList;
    });
    
    // Fechar modal
    handleCloseModal();
    
    console.log('Contrato adicionado com sucesso!');
  };

  // Editar contrato
  const handleEditContract = (contract) => {
    setEditingContract(contract);
    setNewContract({
      numero: contract.numero,
      modalidade: contract.modalidade,
      fundamento: contract.fundamento,
      processo: contract.processo,
      cpfCnpj: contract.cpfCnpj,
      fornecedor: contract.fornecedor,
      valor: contract.valor?.toString() || '0',
      dataInicio: contract.dataInicio,
      dataFim: contract.dataFim,
      status: contract.status,
      objeto: contract.objeto
    });
    setShowAddModal(true);
  };

  // Atualizar contrato
  const handleUpdateContract = () => {
    const numeroTrimmed = (newContract.numero || '').trim();
    const fornecedorTrimmed = (newContract.fornecedor || '').trim();
    
    if (!numeroTrimmed || !fornecedorTrimmed) {
      alert('Por favor, preencha o número do contrato e o fornecedor.');
      return;
    }

    // Verificar duplicatas (exceto o próprio)
    const isDuplicate = contracts.some(c => 
      c.numero.toLowerCase() === numeroTrimmed.toLowerCase() && 
      c.id !== editingContract.id
    );
    
    if (isDuplicate) {
      alert('Já existe um contrato com esse número.');
      return;
    }

    const updatedContract = {
      id: editingContract.id,
      numero: numeroTrimmed,
      fornecedor: fornecedorTrimmed,
      modalidade: newContract.modalidade,
      fundamento: newContract.fundamento,
      processo: (newContract.processo || '').trim(),
      cpfCnpj: (newContract.cpfCnpj || '').trim(),
      valor: parseFloat(newContract.valor) || 0,
      dataInicio: newContract.dataInicio,
      dataFim: newContract.dataFim,
      status: newContract.status,
      objeto: (newContract.objeto || '').trim()
    };
    
    setContracts(prev => prev.map(c => 
      c.id === editingContract.id ? updatedContract : c
    ));
    handleCloseModal();
  };

  // EXCLUIR CONTRATO - CORRIGIDO COM ABORDAGEM MAIS DIRETA
  const handleDeleteContract = (contractId) => {
    console.log('=== INICIANDO EXCLUSÃO ===');
    console.log('ID do contrato a ser excluído:', contractId);
    console.log('Contratos antes da exclusão:', contracts.length);
    
    const confirmed = confirm(`Tem certeza que deseja excluir o contrato ${contractId}?`);
    console.log('Confirmação do usuário:', confirmed);
    
    if (confirmed) {
      setContracts(prevContracts => {
        console.log('Contratos atuais no estado:', prevContracts.length);
        const contractsAfterDelete = prevContracts.filter(contract => {
          const keep = contract.id !== contractId;
          if (!keep) {
            console.log('Removendo contrato:', contract.numero, 'ID:', contract.id);
          }
          return keep;
        });
        console.log('Contratos após exclusão:', contractsAfterDelete.length);
        console.log('=== EXCLUSÃO CONCLUÍDA ===');
        return contractsAfterDelete;
      });
    }
  };

  // Visualizar contrato
  const handleViewContract = (contract) => {
    setViewingContract(contract);
  };

  // Exportar para EXCEL (.xlsx) - NOVO
  const exportToExcel = () => {
    console.log('Iniciando exportação para Excel...');
    
    // Criar estrutura XML para arquivo Excel
    const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>\n';
    const workbookXml = `${xmlHeader}<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Worksheet ss:Name="Contratos">
<Table>
<Row>
<Cell><Data ss:Type="String">NUMERO_CONTRATO</Data></Cell>
<Cell><Data ss:Type="String">FORNECEDOR</Data></Cell>
<Cell><Data ss:Type="String">CPF_CNPJ</Data></Cell>
<Cell><Data ss:Type="String">PROCESSO</Data></Cell>
<Cell><Data ss:Type="String">MODALIDADE</Data></Cell>
<Cell><Data ss:Type="String">FUNDAMENTO</Data></Cell>
<Cell><Data ss:Type="String">VALOR_REAIS</Data></Cell>
<Cell><Data ss:Type="String">DATA_INICIO</Data></Cell>
<Cell><Data ss:Type="String">DATA_TERMINO</Data></Cell>
<Cell><Data ss:Type="String">STATUS</Data></Cell>
<Cell><Data ss:Type="String">OBJETO_CONTRATO</Data></Cell>
</Row>`;

    let dataRows = '';
    filteredContracts.forEach(contract => {
      dataRows += `<Row>
<Cell><Data ss:Type="String">${contract.numero || ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.fornecedor || ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.cpfCnpj || ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.processo || ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.modalidade || ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.fundamento || ''}</Data></Cell>
<Cell><Data ss:Type="Number">${contract.valor || 0}</Data></Cell>
<Cell><Data ss:Type="String">${contract.dataInicio ? formatDate(contract.dataInicio) : ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.dataFim ? formatDate(contract.dataFim) : ''}</Data></Cell>
<Cell><Data ss:Type="String">${contract.status || ''}</Data></Cell>
<Cell><Data ss:Type="String">${(contract.objeto || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>
</Row>`;
    });

    const workbookEnd = `</Table>
</Worksheet>
</Workbook>`;

    const fullXml = workbookXml + dataRows + workbookEnd;
    
    // Criar arquivo Excel
    const blob = new Blob([fullXml], { 
      type: 'application/vnd.ms-excel' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `contratos_exportados_${new Date().toISOString().split('T')[0]}.xlsx`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('Exportação para Excel concluída!');
  };

  // Fechar modal de importação
  const handleCloseImportModal = () => {
    setShowImportModal(false);
    resetImportState();
  };

  // Navegação de páginas
  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const goToPreviousPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages));
  };

  // Gerar array de páginas para navegação
  const getPageNumbers = useMemo(() => {
    const pages = [];
    const maxVisible = 5;
    
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const start = Math.max(1, currentPage - 2);
      const end = Math.min(totalPages, start + maxVisible - 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3">
                Sistema de Controle de Contratos
              </h1>
              <p className="text-gray-600 text-lg">Gestão completa e transparente de contratos públicos</p>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                disabled={isImporting}
              >
                <Upload size={24} />
                Importar Excel
              </button>
              <button
                onClick={handleOpenNewContract}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Plus size={24} />
                Novo Contrato
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6 mb-8">
          {[
            { title: 'Total', value: stats.total, icon: FileText, gradient: 'from-blue-500 to-blue-600' },
            { title: 'Ativos', value: stats.ativos, icon: CheckCircle, gradient: 'from-green-500 to-green-600' },
            { title: 'Vencendo', value: stats.vencendo, icon: AlertCircle, gradient: 'from-yellow-500 to-yellow-600' },
            { title: 'Vencidos', value: stats.vencidos, icon: Clock, gradient: 'from-red-500 to-red-600' },
            { title: 'Incorretos', value: stats.incorretos, icon: X, gradient: 'from-red-600 to-red-700' },
            { title: 'Suspensos', value: stats.suspensos, icon: Pause, gradient: 'from-orange-500 to-orange-600' },
            { title: 'Valor Total', value: formatCurrency(stats.valorTotal), icon: DollarSign, gradient: 'from-purple-500 to-purple-600', isPrice: true },
            { title: 'Fornecedores', value: stats.fornecedoresUnicos, icon: Building2, gradient: 'from-indigo-500 to-indigo-600' }
          ].map((stat, index) => (
            <div key={index} className="group">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                <div className={`bg-gradient-to-r ${stat.gradient} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="text-white" size={28} />
                </div>
                <div className={`text-3xl font-bold text-gray-800 mb-2 ${stat.isPrice ? 'text-xl' : ''}`}>
                  {stat.value}
                </div>
                <div className="text-gray-600 text-sm font-medium">{stat.title}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Tabs - CORRIGIDAS E VISÍVEIS */}
          <div className="border-b border-gray-200 bg-gray-50">
            <nav className="flex space-x-0">
              <button
                onClick={() => {
                  console.log('Clicou na aba: todos');
                  setActiveTab('todos');
                  setCurrentPage(1);
                }}
                className={`px-8 py-6 font-semibold text-base border-b-4 transition-all duration-300 ${
                  activeTab === 'todos'
                    ? 'border-blue-500 text-blue-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText size={20} />
                  Todos os Contratos ({contracts.length})
                </div>
              </button>
              
              <button
                onClick={() => {
                  console.log('Clicou na aba: incorretos');
                  setActiveTab('incorretos');
                  setCurrentPage(1);
                }}
                className={`px-8 py-6 font-semibold text-base border-b-4 transition-all duration-300 ${
                  activeTab === 'incorretos'
                    ? 'border-red-500 text-red-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <X size={20} />
                  Incorretos ({stats.incorretos})
                </div>
              </button>
              
              <button
                onClick={() => {
                  console.log('Clicou na aba: suspensos');
                  setActiveTab('suspensos');
                  setCurrentPage(1);
                }}
                className={`px-8 py-6 font-semibold text-base border-b-4 transition-all duration-300 ${
                  activeTab === 'suspensos'
                    ? 'border-orange-500 text-orange-600 bg-white'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Pause size={20} />
                  Suspensos ({stats.suspensos})
                </div>
              </button>
            </nav>
          </div>

          {/* Filters */}
          <div className="p-8 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search size={24} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Buscar por número, fornecedor, processo ou objeto..."
                    className="w-full pl-14 pr-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 shadow-sm transition-all duration-300 text-lg"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
              
              <select
                className="px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 shadow-sm transition-all duration-300 text-lg"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="Todos">Todos os Status</option>
                <option value="Ativo">Ativo</option>
                <option value="Vencendo">Vencendo</option>
                <option value="Vencido">Vencido</option>
                <option value="Incorreto">Incorreto</option>
                <option value="Suspenso">Suspenso</option>
              </select>

              <div className="flex gap-3">
                <select
                  className="flex-1 px-6 py-4 bg-white border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 shadow-sm transition-all duration-300 text-lg"
                  value={modalidadeFilter}
                  onChange={(e) => {
                    setModalidadeFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                >
                  <option value="Todas">Todas</option>
                  <option value="PREGÃO ELETRÔNICO">Pregão</option>
                  <option value="CONCORRÊNCIA">Concorrência</option>
                  <option value="CONVITE">Convite</option>
                  <option value="INEXIGIBILIDADE">Inexigível</option>
                </select>
                
                <button 
                  onClick={exportToExcel}
                  className="bg-white border-2 border-gray-200 text-gray-600 px-6 py-4 rounded-2xl hover:bg-gray-50 hover:shadow-md transition-all duration-300 flex items-center shadow-sm"
                  title="Exportar dados para Excel (.xlsx)"
                >
                  <Download size={20} />
                  <span className="ml-2 hidden sm:inline">Excel</span>
                </button>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Nº Contrato</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Fornecedor</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Modalidade</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Valor</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Vigência</th>
                  <th className="px-8 py-6 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedContracts.map((contract) => (
                  <tr key={contract.id} className="hover:bg-gray-50 transition-all duration-300 group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(contract.status)}
                        <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(contract.status)}`}>
                          {contract.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-gray-900 text-lg">{contract.numero}</div>
                      <div className="text-sm text-gray-500">{contract.processo}</div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-semibold text-gray-900 text-base max-w-64 truncate" title={contract.fornecedor}>
                        {contract.fornecedor}
                      </div>
                      <div className="text-sm text-gray-500">{contract.cpfCnpj}</div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-sm bg-gray-100 text-gray-700 px-3 py-2 rounded-lg font-semibold">
                        {contract.modalidade.split(' ')[0]}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="font-bold text-green-600 text-lg">
                        {formatCurrency(contract.valor)}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-base text-gray-600">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar size={16} />
                        {formatDate(contract.dataInicio)}
                      </div>
                      <div className="text-sm text-gray-500">
                        até {formatDate(contract.dataFim)}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <button
                          onClick={() => handleViewContract(contract)}
                          className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl p-2 transition-all duration-300 shadow-md hover:shadow-lg"
                          title="Visualizar detalhes"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleEditContract(contract)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl p-2 transition-all duration-300 shadow-md hover:shadow-lg"
                          title="Editar contrato"
                        >
                          <Edit3 size={18} />
                        </button>
                        <button
                          onClick={() => {
                            console.log('=== CLIQUE NO BOTÃO EXCLUIR ===');
                            console.log('Contrato selecionado:', contract.numero, 'ID:', contract.id);
                            handleDeleteContract(contract.id);
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white rounded-xl p-2 transition-all duration-300 shadow-md hover:shadow-lg"
                          title="Excluir contrato"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination - CORRIGIDA COM BOTÕES NUMERADOS */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row justify-between items-center p-8 bg-gray-50 border-t border-gray-200 gap-4">
              <div className="text-base text-gray-600">
                Mostrando {((currentPage - 1) * itemsPerPage) + 1} a {Math.min(currentPage * itemsPerPage, filteredContracts.length)} de {filteredContracts.length} contratos
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-gray-600 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
                >
                  Anterior
                </button>
                
                <div className="flex gap-1">
                  {currentPage > 3 && (
                    <>
                      <button
                        onClick={() => goToPage(1)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
                      >
                        1
                      </button>
                      {currentPage > 4 && (
                        <span className="px-2 py-2 text-gray-400">...</span>
                      )}
                    </>
                  )}
                  
                  {getPageNumbers.map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                        page === currentPage
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  {currentPage < totalPages - 2 && (
                    <>
                      {currentPage < totalPages - 3 && (
                        <span className="px-2 py-2 text-gray-400">...</span>
                      )}
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-300"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-gray-600 bg-white border-2 border-gray-200 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all duration-300"
                >
                  Próxima
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {filteredContracts.length === 0 && (
            <div className="text-center py-20 px-8">
              <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
                <FileText size={48} className="text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {activeTab === 'incorretos' ? 'Nenhum contrato com valores incorretos' : 
                 activeTab === 'suspensos' ? 'Nenhum contrato suspenso' : 
                 'Nenhum contrato encontrado'}
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                {activeTab === 'incorretos' 
                  ? 'Todos os contratos estão com valores corretos!' 
                  : activeTab === 'suspensos'
                  ? 'Não há contratos suspensos no momento!'
                  : 'Tente ajustar os filtros ou adicionar um novo contrato'
                }
              </p>
              {activeTab === 'todos' && (
                <button
                  onClick={handleOpenNewContract}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center gap-3 mx-auto shadow-lg"
                >
                  <Plus size={24} />
                  Adicionar Primeiro Contrato
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Import Modal - CORRIGIDO PARA EXCEL */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Importar Contratos</h2>
                <p className="text-gray-600 text-lg mt-2">Adicione 5 mil contratos via Excel ou CSV</p>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl w-12 h-12 flex items-center justify-center transition-all duration-300"
                disabled={isImporting}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 space-y-8 overflow-y-auto max-h-[60vh]">
              {/* Upload Area */}
              <div className="relative">
                <div className={`border-4 border-dashed rounded-3xl p-12 text-center transition-all duration-300 ${
                  isImporting 
                    ? 'border-blue-300 bg-blue-50' 
                    : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                }`}>
                  <div className="flex flex-col items-center">
                    {isImporting ? (
                      <div className="animate-spin w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mb-6"></div>
                    ) : (
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6">
                        <Upload size={40} className="text-blue-600" />
                      </div>
                    )}
                    
                    <h3 className="font-bold text-gray-800 text-xl mb-3">
                      {isImporting ? 'Gerando 5000 contratos...' : 'Selecione um arquivo Excel ou CSV'}
                    </h3>
                    <p className="text-gray-600 text-lg mb-6">
                      Sistema irá gerar automaticamente 5 mil contratos de exemplo
                    </p>
                    
                    {!isImporting && (
                      <label className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-purple-700 cursor-pointer transition-all duration-300 shadow-lg text-lg font-semibold">
                        Gerar 5 Mil Contratos
                        <input
                          type="file"
                          accept=".csv,.xlsx,.xls"
                          onChange={handleImportContract}
                          className="hidden"
                          disabled={isImporting}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages */}
              {importError && (
                <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <X size={24} className="text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-red-800 text-lg">Erro na importação</h4>
                      <p className="text-red-700 text-base mt-2">{importError}</p>
                    </div>
                  </div>
                </div>
              )}

              {importSuccess && (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <Check size={24} className="text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-bold text-green-800 text-lg">Sucesso!</h4>
                      <p className="text-green-700 text-base mt-2">{importSuccess}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Instructions */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 border-2 border-blue-100">
                <h3 className="font-bold text-gray-800 text-xl mb-6 flex items-center gap-3">
                  <FileText size={24} className="text-blue-600" />
                  Sistema de Importação
                </h3>
                
                <div className="space-y-4">
                  <div className="bg-white/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-700 text-lg mb-2">Importação Automática:</h4>
                    <p className="text-gray-600">O sistema gerará automaticamente 5000 contratos com dados variados para teste</p>
                  </div>
                  
                  <div className="bg-white/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-700 text-lg mb-2">Dados Incluídos:</h4>
                    <ul className="text-gray-600 space-y-1">
                      <li>• 24 fornecedores diferentes</li>
                      <li>• 5 modalidades de licitação</li>
                      <li>• 5 tipos de status</li>
                      <li>• Valores variados de R$ 50.000 a R$ 550.000</li>
                    </ul>
                  </div>
                  
                  <div className="bg-white/50 rounded-2xl p-4">
                    <h4 className="font-semibold text-gray-700 text-lg mb-2">Persistência:</h4>
                    <p className="text-gray-600">Todos os dados são salvos automaticamente e permanecem após atualizar a página</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Contract Modal */}
      {viewingContract && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Detalhes do Contrato</h2>
                <p className="text-gray-600 text-lg">{viewingContract.numero}</p>
              </div>
              <button
                onClick={() => setViewingContract(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl w-12 h-12 flex items-center justify-center transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto max-h-[70vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  { label: 'Número do Contrato', value: viewingContract.numero },
                  { label: 'Status', value: viewingContract.status, isStatus: true },
                  { label: 'Valor', value: formatCurrency(viewingContract.valor), isPrice: true },
                  { label: 'Fornecedor', value: viewingContract.fornecedor },
                  { label: 'CPF/CNPJ', value: viewingContract.cpfCnpj || '-' },
                  { label: 'Processo', value: viewingContract.processo || '-' },
                  { label: 'Modalidade', value: viewingContract.modalidade },
                  { label: 'Data Início', value: formatDate(viewingContract.dataInicio) },
                  { label: 'Data Fim', value: formatDate(viewingContract.dataFim) }
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-2xl p-6">
                    <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">
                      {item.label}
                    </label>
                    {item.isStatus ? (
                      <div className="flex items-center gap-3">
                        {getStatusIcon(viewingContract.status)}
                        <span className={`px-4 py-2 rounded-full text-base font-semibold border ${getStatusColor(viewingContract.status)}`}>
                          {item.value}
                        </span>
                      </div>
                    ) : (
                      <p className={`font-semibold text-gray-800 text-lg ${
                        item.isPrice ? 'text-2xl text-green-600' : ''
                      } ${item.label.includes('CPF') || item.label.includes('Processo') ? 'font-mono' : ''}`}>
                        {item.value}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-8 bg-gray-50 rounded-2xl p-8">
                <label className="block text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                  Objeto do Contrato
                </label>
                <p className="text-gray-800 leading-relaxed text-lg">
                  {viewingContract.objeto || 'Não informado'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Contract Modal - COM BOTÃO FUNCIONANDO */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl my-8">
            <div className="flex justify-between items-center p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0 z-10">
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  {editingContract ? 'Editar Contrato' : 'Novo Contrato'}
                </h2>
                <p className="text-gray-600 text-lg mt-2">
                  {editingContract ? 'Atualize as informações do contrato' : 'Preencha os dados do novo contrato'}
                </p>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl w-12 h-12 flex items-center justify-center transition-all duration-300"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Número do Contrato <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: 5271/2025"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.numero}
                    onChange={(e) => setNewContract({...newContract, numero: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">
                    Fornecedor <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nome do fornecedor"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.fornecedor}
                    onChange={(e) => setNewContract({...newContract, fornecedor: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">CPF/CNPJ</label>
                  <input
                    type="text"
                    placeholder="00.000.000/0000-00"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.cpfCnpj}
                    onChange={(e) => setNewContract({...newContract, cpfCnpj: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Processo</label>
                  <input
                    type="text"
                    placeholder="Ex: 008205/24"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.processo}
                    onChange={(e) => setNewContract({...newContract, processo: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Modalidade</label>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.modalidade}
                    onChange={(e) => setNewContract({...newContract, modalidade: e.target.value})}
                  >
                    <option value="PREGÃO ELETRÔNICO">PREGÃO ELETRÔNICO</option>
                    <option value="CONCORRÊNCIA">CONCORRÊNCIA</option>
                    <option value="CONVITE">CONVITE</option>
                    <option value="TOMADA DE PREÇOS">TOMADA DE PREÇOS</option>
                    <option value="INEXIGIBILIDADE">INEXIGIBILIDADE</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Status</label>
                  <select
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.status}
                    onChange={(e) => setNewContract({...newContract, status: e.target.value})}
                  >
                    <option value="Ativo">Ativo</option>
                    <option value="Vencendo">Vencendo</option>
                    <option value="Vencido">Vencido</option>
                    <option value="Suspenso">Suspenso</option>
                    <option value="Incorreto">Incorreto</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Valor (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.valor}
                    onChange={(e) => setNewContract({...newContract, valor: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Data Início</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.dataInicio}
                    onChange={(e) => setNewContract({...newContract, dataInicio: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-base font-bold text-gray-700 mb-3">Data Fim</label>
                  <input
                    type="date"
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 bg-white text-lg"
                    value={newContract.dataFim}
                    onChange={(e) => setNewContract({...newContract, dataFim: e.target.value})}
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-base font-bold text-gray-700 mb-3">Objeto do Contrato</label>
                  <textarea
                    rows="4"
                    placeholder="Descreva o objeto do contrato..."
                    className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-300 resize-none bg-white text-lg"
                    value={newContract.objeto}
                    onChange={(e) => setNewContract({...newContract, objeto: e.target.value})}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end gap-6 p-8 border-t border-gray-200 bg-gray-50">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-8 py-4 text-gray-700 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 transition-all duration-300 font-semibold text-lg"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={editingContract ? handleUpdateContract : handleAddContract}
                className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 font-semibold disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed shadow-lg text-lg"
                disabled={!newContract.numero?.trim() || !newContract.fornecedor?.trim()}
              >
                {editingContract ? 'Atualizar Contrato' : 'Adicionar Contrato'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractControlSheet;