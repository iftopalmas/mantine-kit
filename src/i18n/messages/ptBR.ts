import dayjs from 'dayjs';

import { KitMessages } from '../KitMessages';

/** Brazilian Portuguese texts. */
export const ptBR: KitMessages = {
    common: {
        back: 'Voltar',
        save: 'Salvar',
        cancel: 'Cancelar',
        confirm: 'Confirmar',
        add: 'Adicionar',
        home: 'Início',
        success: 'Sucesso',
        warning: 'Atenção',
        error: 'Erro',
        loadError: 'Erro ao carregar dados',
        dateFormat: 'DD/MM/YYYY'
    },
    form: {
        action: { create: 'Criar', edit: 'Atualizar', view: 'Visualizar', custom: 'Personalizar' },
        saveSuccess: action => `Sucesso ao ${action.toLowerCase()} cadastro!`,
        saveError: action => `Erro ao ${action.toLowerCase()} cadastro`,
        createSuccess: 'Registro cadastrado com sucesso',
        createError: 'Houve um erro ao realizar o cadastro!',
        updateSuccess: 'Cadastro atualizado com sucesso',
        updateError: 'Houve um erro ao atualizar o cadastro',
        confirmTitle: 'Confirme sua ação'
    },
    table: {
        actions: 'Ações',
        view: 'Visualizar',
        edit: 'Editar',
        delete: 'Deletar',
        deleteConfirm: 'Você está prestes a excluir este cadastro. Tem certeza de que deseja continuar?',
        deleteSuccess: 'Cadastro excluído com sucesso!',
        noRecords: 'Não há registros disponíveis para exibição.',
        recordsPerPage: 'Registros por página',
        pagination: ({ from, to, totalRecords }) => `Exibindo ${from} a ${to} de ${totalRecords} registros`,
        listTitle: pluralName => `Lista de ${pluralName}`
    },
    rowEdit: {
        edit: 'Editar valores (Enter)',
        confirm: 'Confirmar edição (Enter)',
        cancel: 'Cancelar edição (Esc)'
    },
    select: {
        placeholder: label => `Selecione o(a) ${label}`,
        nothingFound: label => `${label} não encontrado(a)`
    },
    layout: {
        userMenu: 'Acessar opções do usuário',
        userMenuTitle: 'Opções do Usuário',
        enableDarkTheme: 'Ativar tema escuro',
        enableLightTheme: 'Ativar tema claro',
        collapseNavigation: 'Recolher menu de navegação',
        expandNavigation: 'Expandir menu de navegação'
    },
    print: {
        pdfTipTitle: 'Para salvar em PDF',
        pdfTip:
            'Na janela de impressão, escolha "Salvar como PDF" como destino e desmarque "Cabeçalhos e rodapés", ' +
            'para o PDF ter só os do relatório.',
        printButton: 'Imprimir ou salvar como PDF'
    },
    stats: {
        comparedToLastMonth: 'Comparado ao último mês'
    },
    export: {
        button: 'Exportar',
        failed: formatLabel => `Não foi possível exportar em ${formatLabel}.`,
        generatedAt: date => `Gerado em ${dayjs(date).format('DD/MM/YYYY [às] HH:mm')}`,
        footer: systemName => `Dados gerados pelo ${systemName}`,
        excelPageNumber: 'Página &P de &N',
        invalidCell: 'Erro',
        defaultFileName: 'dados',
        defaultSheetName: position => `Aba ${position}`
    },
    chart: {
        types: { bar: 'Colunas', line: 'Linha', 'stacked-bar': 'Colunas empilhadas', donut: 'Rosca (um ano)' },
        saveAsImage: 'Exportar imagem',
        total: formattedTotal => `Total: ${formattedTotal}`
    },
    http: {
        unknownError: 'Erro desconhecido',
        noResponse: 'Nenhuma resposta recebida',
        requestFailed: 'Requisição falhou'
    }
};
